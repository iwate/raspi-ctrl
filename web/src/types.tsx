import { Edge, Node } from "reactflow"

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>

type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>

export const NC = 0
export type PinIndex = typeof NC | IntRange<1, 41>
export type PinFeature = 'in' | 'out' | 'softpwm' | 'pwm0' | 'pwm1' | 'clk0' | 'clk1' | 'clk2' | '3v3' | '5v' | 'gnd'
export type PinSpec = {
    index: PinIndex
    gpio: number|null
    features: PinFeature[]
}
export type Pin = {
    index: PinIndex
    gpio: number|null
    feature: PinFeature
}

export type CtrlOptionsBase = {
    cx: number
    cy: number
    label: string
}

export type ButtonColors = 'red' | 'blue' | 'yellow' | 'green' | 'black'

export type CtrlButtonOptions = CtrlOptionsBase & {
    r: number
    color: ButtonColors
    symbol: string
}

export type CtrlAnalogPadOptions = CtrlOptionsBase & {
    r: number
}

export type CtrlCrownOptions = CtrlOptionsBase & {
    r: number
    max: number
}

export type Direction = 'horizontal' | 'vertical'

export type CtrlSliderOptions = CtrlOptionsBase & {
    dir: Direction
    r: number
    momentary: boolean
}

export type LEDColors = 'red' | 'blue' | 'yellow' | 'green'

export type CtrlLEDOptions = CtrlOptionsBase & {
    color: LEDColors
}

export type Ctrl = {
    id: string
    type: 'button'
    options: CtrlButtonOptions
} | {
    id: string
    type: 'analogpad'
    options: CtrlAnalogPadOptions
} | {
    id: string
    type: 'crown'
    options: CtrlCrownOptions
} | {
    id: string
    type: 'slider'
    options: CtrlSliderOptions
} | {
    id: string
    type: 'led'
    options: CtrlLEDOptions
}

type DriverBase = {
    id: string, 
    label: string
}

export type HBridge = DriverBase & {
    type: 'hbridge'
    pin1: PinIndex
    pin2: PinIndex
    limit1: PinIndex
    limit2: PinIndex
}

export type PWMHBridge = DriverBase & {
    type: 'pwm_hbridge'
    pin1: PinIndex
    pin2: PinIndex
    limit1: PinIndex
    limit2: PinIndex
    pwm: PinIndex
}

export type Stepping = DriverBase & {
    type: 'stepping'
    dir: PinIndex
    clk: PinIndex
    limit1: PinIndex
    limit2: PinIndex
}

export type Input = DriverBase & {
    type: 'input'
    pin: PinIndex
}

export type Driver =  HBridge | PWMHBridge | Stepping | Input

export type Settings = {
    ctrlSize: { width: number, height: number }
    nodes: Node[]
    edges: Edge[]
    drivers: Node[]
    code: {[key:string]:string}
}