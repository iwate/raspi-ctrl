import { Connection, useStoreApi } from "reactflow";
import { Raspi4Pins } from "../raspi4";

const ALLOWED_MAP: any = {
    ctrl_button: {
        press: {
            driver_hbridge: ['in1', 'in2'],
            driver_pwmhbridge: ['in1', 'in2'],
            driver_stepping: ['cwccw'],
            driver_output: ['in'],
            calc_not: ['in'],
        }
    },
    ctrl_slider: {
        value: {
            calc_abs: ['in'],
            calc_lt: ['in'],
            calc_gt: ['in'],
        }
    },
    ctrl_crown: {
        value: {
            driver_pwmhbridge: ['duty'],
            driver_stepping: ['freq'],
            calc_lt: ['in'],
            calc_gt: ['in'],
        }
    },
    ctrl_analogpad: {
        x: {
            calc_abs: ['in'],
            calc_lt: ['in'],
            calc_gt: ['in'],
        },
        y: {
            calc_abs: ['in'],
            calc_lt: ['in'],
            calc_gt: ['in'],
        }
    },
    ctrl_led: {
        in: {
            driver_input: ['out'],
        }
    },
    calc_not: {
        out: {
            driver_hbridge: ['in1', 'in2'],
            driver_pwmhbridge: ['in1', 'in2'],
            driver_stepping: ['cwccw'],
            driver_output: ['in'],
        }
    },
    calc_lt: {
        out: {
            driver_hbridge: ['in1', 'in2'],
            driver_pwmhbridge: ['in1', 'in2'],
            driver_stepping: ['cwccw'],
            driver_output: ['in'],
            calc_not: ['in'],
        }
    },
    calc_gt: {
        out: {
            driver_hbridge: ['in1', 'in2'],
            driver_pwmhbridge: ['in1', 'in2'],
            driver_stepping: ['cwccw'],
            driver_output: ['in'],
            calc_not: ['in'],
        }
    },
    calc_abs: {
        out: {
            driver_pwmhbridge: ['duty'],
            driver_stepping: ['freq'],
            calc_lt: ['in'],
            calc_gt: ['in'],
        }
    },
    driver_hbridge: {
        pin1: {
            raspi: Raspi4Pins.filter(pin => pin.features.includes('out')).map(pin => String(pin.index))
        },
        pin2: {
            raspi: Raspi4Pins.filter(pin => pin.features.includes('out')).map(pin => String(pin.index))
        },
        limit1: {
            raspi: Raspi4Pins.filter(pin => pin.features.includes('in')).map(pin => String(pin.index))
        },
        limit2: {
            raspi: Raspi4Pins.filter(pin => pin.features.includes('in')).map(pin => String(pin.index))
        },
    },
    driver_pwmhbridge: {
        pin1: {
            raspi: Raspi4Pins.filter(pin => pin.features.includes('out')).map(pin => String(pin.index))
        },
        pin2: {
            raspi: Raspi4Pins.filter(pin => pin.features.includes('out')).map(pin => String(pin.index))
        },
        pwm: {
            raspi: Raspi4Pins.filter(pin => pin.features.some(f => f.startsWith('pwm'))).map(pin => String(pin.index))
        },
        limit1: {
            raspi: Raspi4Pins.filter(pin => pin.features.includes('in')).map(pin => String(pin.index))
        },
        limit2: {
            raspi: Raspi4Pins.filter(pin => pin.features.includes('in')).map(pin => String(pin.index))
        },
    },
    driver_stepping: {
        dir: {
            raspi: Raspi4Pins.filter(pin => pin.features.includes('out')).map(pin => String(pin.index))
        },
        clk: {
            raspi: Raspi4Pins.filter(pin => pin.features.some(f => f.startsWith('clk'))).map(pin => String(pin.index))
        },
        limit1: {
            raspi: Raspi4Pins.filter(pin => pin.features.includes('in')).map(pin => String(pin.index))
        },
        limit2: {
            raspi: Raspi4Pins.filter(pin => pin.features.includes('in')).map(pin => String(pin.index))
        },
    },
    driver_input: {
        pin: {
            raspi: Raspi4Pins.filter(pin => pin.features.includes('in')).map(pin => String(pin.index))
        },
    },
    driver_output: {
        pin: {
            raspi: Raspi4Pins.filter(pin => pin.features.includes('out')).map(pin => String(pin.index))
        },
    }
}

export function useConnectionValidation() {
    const store = useStoreApi(); 
    return (connection: Connection) => {
        const { nodeInternals } = store.getState();
        const nodes = Array.from(nodeInternals.values());
        const source = nodes.find(n => n.id == connection.source);
        const target = nodes.find(n => n.id == connection.target);
        const sourceType = source?.type ?? '';
        const targetType = target?.type ?? '';
        const sourceHandle = connection.sourceHandle ?? '';
        const targetHandle = connection.targetHandle ?? '';

        return ALLOWED_MAP[sourceType]?.[sourceHandle]?.[targetType]?.includes(targetHandle) === true;
    }
}