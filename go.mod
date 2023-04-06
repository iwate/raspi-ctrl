module github.com/iwate/raspi-ctrl

go 1.19

require github.com/labstack/echo/v4 v4.10.0

require (
	github.com/golang-jwt/jwt v3.2.2+incompatible // indirect
	github.com/stianeikeland/go-rpio/v4 v4.6.0 // indirect
	golang.org/x/time v0.2.0 // indirect
)

require (
	github.com/labstack/gommon v0.4.0 // indirect
	github.com/mattn/go-colorable v0.1.13 // indirect
	github.com/mattn/go-isatty v0.0.16 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasttemplate v1.2.2 // indirect
	golang.org/x/crypto v0.2.0 // indirect
	golang.org/x/net v0.4.0
	golang.org/x/sys v0.3.0 // indirect
	golang.org/x/text v0.5.0 // indirect
	raspi-ctrl/web v0.0.0
)

replace raspi-ctrl/web v0.0.0 => ./web
