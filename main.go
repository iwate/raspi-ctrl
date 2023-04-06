package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math"
	"net/http"
	"os"
	"raspi-ctrl/web"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/stianeikeland/go-rpio/v4"
	"golang.org/x/net/websocket"
)

type SettingsPin struct {
	Index   int    `json:"index"`
	Gpio    int    `json:"gpio"`
	Feature string `json:"feature"`
}
type SettingsDriver struct {
	Id     string `json:"id"`
	Type   string `json:"Type"`
	Pin    int    `json:"pin,omitempty"`
	Pin1   int    `json:"pin1,omitempty"`
	Pin2   int    `json:"pin2,omitempty"`
	Limit1 int    `json:"limit1,omitempty"`
	Limit2 int    `json:"limit2,omitempty"`
	Pwm    int    `json:"pwm,omitempty"`
	Dir    int    `json:"dir,omitempty"`
	Clk    int    `json:"clk,omitempty"`
}
type SettingsNode struct {
	Type string `json:"type"`
	Id   string `json:"id"`
}
type Settings struct {
	Pins    []*SettingsPin    `json:"pins"`
	Drivers []*SettingsDriver `json:"drivers"`
}

var notice = make(chan string)

func newMask(index int) uint64 {
	var mask uint64 = 1
	mask <<= index
	return ^mask
}

var settingsFile []byte
var settings Settings
var pins map[int]rpio.Pin
var softpwm uint64 = 0
var input uint64 = 0xFFFF_FFFF_FFFF_FFFF

const filepath = "settings.json"

func setup() {
	var err error
	settingsFile, err = ioutil.ReadFile(filepath)
	if err != nil {
		settingsFile = []byte(`{
			"ctrlSize": {
				"width": 844,
				"height": 390
			},
			"nodes":[],
			"edges":[],
			"pins": [],
			"drivers": []
		}`)
	}
	fmt.Printf("%s: %d", filepath, len(settingsFile))
	if err := json.Unmarshal(settingsFile, &settings); err != nil {
		panic(err)
	}

	pins = make(map[int]rpio.Pin, len(settings.Pins))
	for _, p := range settings.Pins {
		fmt.Printf("#%d gpio:%d %s\n", p.Index, p.Gpio, p.Feature)
		if p.Feature == "in" {
			pin := rpio.Pin(p.Gpio)
			pin.PullUp()
			pins[p.Index] = pin
		} else if p.Feature == "out" {
			pin := rpio.Pin(p.Gpio)
			pin.Output()
			pins[p.Index] = pin
		} else if p.Feature == "softpwm" {
			pin := rpio.Pin(p.Gpio)
			pin.Output()
			pins[p.Index] = pin
			softpwm |= (1 << p.Index)
		} else if p.Feature == "pwm0" || p.Feature == "pwm1" {
			pin := rpio.Pin(p.Gpio)
			pin.Pwm()
			pin.Freq(64000)
			pin.DutyCycle(0, 32)
			pins[p.Index] = pin
		} else if p.Feature == "clk0" || p.Feature == "clk1" {
			pin := rpio.Pin(p.Gpio)
			pin.Clock()
			pins[p.Index] = pin
		}
	}
}

func softclk(pin rpio.Pin) {

}

func worker() {
	for {
		for _, d := range settings.Drivers {
			if d.Type == "driver_hbridge" || d.Type == "driver_pwmhbridge" {
				if d.Limit1 != 0 && d.Pin1 != 0 {
					limit1 := pins[d.Limit1].Read()
					if limit1 == rpio.Low {
						pins[d.Pin1].Write(rpio.Low)
					}
				}
				if d.Limit2 != 0 && d.Pin2 != 0 {
					limit2 := pins[d.Limit2].Read()
					if limit2 == rpio.Low {
						pins[d.Pin2].Write(rpio.Low)
					}
				}
			} else if d.Type == "driver_stepping" {
				if d.Dir != 0 && d.Clk != 0 {
					dir := pins[d.Dir].Read()
					if d.Limit1 != 0 {
						limit1 := pins[d.Limit1].Read()
						if limit1 == rpio.Low && dir == rpio.Low {
							pins[d.Clk].Freq(0)
						}
					}
					if d.Limit2 != 0 {
						limit2 := pins[d.Limit2].Read()
						if limit2 == rpio.Low && dir == rpio.High {
							pins[d.Clk].Freq(0)
						}
					}
				}
			} else if d.Type == "driver_input" {
				if d.Pin != 0 {
					value := pins[d.Pin].Read()
					mask := newMask(d.Pin)
					prev := rpio.High
					if input&mask == 0 {
						prev = rpio.Low
					}
					if prev != value {
						if value == rpio.High {
							notice <- fmt.Sprintf("{\"type\":\"input\",\"id\":\"%s\",\"value\":true}", d.Id)
						} else {
							notice <- fmt.Sprintf("{\"type\":\"input\",\"id\":\"%s\",\"value\":false}", d.Id)
						}
					}
					input |= (1 << d.Pin)
				}
			}
		}
		time.Sleep(1 * time.Millisecond)
	}
}

type Action struct {
	Type string  `json:"type"`
	Id   string  `json:"id"`
	In1  bool    `json:"in1,omitempty"`
	In2  bool    `json:"in2,omitempty"`
	Dir  bool    `json:"cwccw,omitempty"`
	Duty float64 `json:"duty,omitempty"`
	Freq float64 `json:"freq,omitempty"`
}

func connection(c echo.Context) error {
	websocket.Handler(func(ws *websocket.Conn) {
		defer ws.Close()
		go func() {
			for {
				msg := <-notice
				err := websocket.Message.Send(ws, msg)
				if err != nil {
					c.Logger().Error(err)
				}
			}
		}()
		for {
			// Read
			msg := ""
			err := websocket.Message.Receive(ws, &msg)
			if err != nil {
				c.Logger().Error(err)
				break
			}
			fmt.Printf("%s\n", msg)
			actions := make([]*Action, 0)
			err = json.Unmarshal([]byte(msg), &actions)
			if err != nil {
				fmt.Printf("%s\n", err)
				continue
			}

			for _, action := range actions {
				var driver *SettingsDriver = nil

				for _, d := range settings.Drivers {
					if d.Id == action.Id {
						driver = d
					}
				}

				if driver == nil {
					continue
				}

				if action.Type == "driver_hbridge" {
					if driver.Pin1 != 0 {
						if action.In1 && (driver.Limit1 == 0 || pins[driver.Limit1].Read() == rpio.High) {
							pins[driver.Pin1].Write(rpio.High)
							fmt.Printf("#%d out(H)\n", driver.Pin1)
						} else {
							pins[driver.Pin1].Write(rpio.Low)
							fmt.Printf("#%d out(L)\n", driver.Pin1)
						}
					}
					if driver.Pin2 != 0 {
						if action.In2 && (driver.Limit2 == 0 || pins[driver.Limit2].Read() == rpio.High) {
							pins[driver.Pin2].Write(rpio.High)
							fmt.Printf("#%d out(H)\n", driver.Pin2)
						} else {
							pins[driver.Pin2].Write(rpio.Low)
							fmt.Printf("#%d out(L)\n", driver.Pin2)
						}
					}
				} else if action.Type == "driver_pwmhbridge" {
					if driver.Pin1 != 0 {
						if action.In1 && (driver.Limit1 == 0 || pins[driver.Limit1].Read() == rpio.High) {
							pins[driver.Pin1].Write(rpio.High)
							fmt.Printf("#%d out(H)\n", driver.Pin1)
						} else {
							pins[driver.Pin1].Write(rpio.Low)
							fmt.Printf("#%d out(L)\n", driver.Pin1)
						}
					}
					if driver.Pin2 != 0 {
						if action.In2 && (driver.Limit2 == 0 || pins[driver.Limit2].Read() == rpio.High) {
							pins[driver.Pin2].Write(rpio.High)
							fmt.Printf("#%d out(H)\n", driver.Pin2)
						} else {
							pins[driver.Pin2].Write(rpio.Low)
							fmt.Printf("#%d out(L)\n", driver.Pin2)
						}
					}
					if driver.Pwm != 0 {
						duty := math.Floor(action.Duty * 32)
						pins[driver.Pwm].DutyCycle(uint32(duty), 32)
						fmt.Printf("#%d pwm(%d/%d)\n", driver.Pwm, uint32(duty), 32)
					}
				} else if action.Type == "driver_stepping" {
					if driver.Dir != 0 {
						if action.Dir {
							pins[driver.Dir].Write(rpio.High)
							fmt.Printf("#%d dir(H)\n", driver.Dir)
						} else {
							pins[driver.Dir].Write(rpio.Low)
							fmt.Printf("#%d dir(L)\n", driver.Dir)
						}
					}
					if driver.Clk != 0 {
						allowCW := action.Dir && (driver.Limit1 == 0 || pins[driver.Limit1].Read() == rpio.High)
						allowCCW := !action.Dir && (driver.Limit2 == 0 || pins[driver.Limit2].Read() == rpio.High)
						if (allowCW || allowCCW) && action.Freq > 0 {
							freq := int(10 * action.Freq)
							pins[driver.Clk].Clock()
							pins[driver.Clk].Freq(freq)
							fmt.Printf("#%d clk(%d)\n", driver.Clk, freq)
						} else {
							pins[driver.Clk].Output()
							pins[driver.Clk].Write(rpio.Low)
							fmt.Printf("#%d clk(0)\n", driver.Clk)
						}
					}
				}
			}
		}
	}).ServeHTTP(c.Response(), c.Request())
	return nil
}

func main() {
	err := rpio.Open()
	if err != nil {
		panic(err)
	}
	defer rpio.Close()
	setup()
	go worker()
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	web.RegisterHandlers(e)
	e.GET("/ws", connection)
	e.POST("/restart", func(c echo.Context) error {
		os.Exit(1)
		return c.String(http.StatusOK, "Restarting...")
	})
	e.POST("/save", func(c echo.Context) error {
		str, err := ioutil.ReadAll(c.Request().Body)
		if err != nil {
			return err
		}
		ioutil.WriteFile(filepath, str, os.ModePerm)

		return c.NoContent(204)
	})
	e.GET("/settings.json", func(c echo.Context) error {
		fmt.Printf("%s: %d", filepath, len(settingsFile))
		return c.Blob(200, "application/json", settingsFile)
	})
	e.Pre(middleware.Rewrite(map[string]string{
		"/settings": "/",
	}))
	e.Logger.Fatal(e.Start(":8080"))
}
