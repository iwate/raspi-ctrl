import { Raspi4Pins } from '../raspi4'
import { Driver, NC, Pin, PinFeature, PinIndex, PinSpec } from '../types'
import './PinTable.css'

function* twin<T>(array: T[]) {
    const max = array.length - (array.length % 2)
    for (let i = 0; i < max; i+=2) {
        yield [array[i], array[i+1]]
    }
}

type Props = {
    drivers: Driver[]
    pins: Pin[]
}

export function PinTable(props: Props) {
    const usedBy = (index: PinIndex) => {
        if (index == NC)
            return [];

        return props.drivers.map(driver => {
            const result = []
            if (driver.type == "input") {
                if (driver.pin == index) result.push(`${driver.label}`);
            }
            else if (driver.type == "hbridge") {
                if (driver.pin1 == index) result.push( `${driver.label}(Pin1)`);
                if (driver.pin2 == index) result.push( `${driver.label}(Pin2)`);
                if (driver.limit1 == index) result.push( `${driver.label}(Limit1)`);
                if (driver.limit2 == index) result.push( `${driver.label}(Limit2)`);
            }
            else if (driver.type == "pwm_hbridge") {
                if (driver.pin1 == index) result.push( `${driver.label}(Pin1)`);
                if (driver.pin2 == index) result.push( `${driver.label}(Pin2)`);
                if (driver.limit1 == index) result.push( `${driver.label}(Limit1)`);
                if (driver.limit2 == index) result.push( `${driver.label}(Limit2)`);
                if (driver.pwm == index) result.push( `${driver.label}(PWM)`);
            }
            else if (driver.type == "stepping") {
                if (driver.dir == index) result.push( `${driver.label}(Dir)`);
                if (driver.clk == index) result.push( `${driver.label}(Clk)`);
                if (driver.limit1 == index) result.push( `${driver.label}(LimitCW)`);
                if (driver.limit2 == index) result.push( `${driver.label}(LimitCCW)`);
            }
            return result;
        }).flat()
    }
    const using = (index: PinIndex) => {
        if (index == NC)
            return [];

        return Object.keys(props.pins.filter(pin => pin.index == index).map(pin => pin.feature).reduce<{[key:string]:string}>((o,f) => {o[f]=f;return o;},{}));
    }
    const featClassName = (pin: PinSpec, f: PinFeature) => {
        const selecteds = using(pin.index);
        
        if (selecteds.length == 0 || !selecteds.includes(f))
            return 'pin__feature';
        
        if (selecteds.length == 1)
            return 'pin__feature pin__feature--selected'

        return 'pin__feature pin__feature--error'
    }
    return <div className="pintable">
        <table>
            <tbody>
                {Array.from(twin(Raspi4Pins)).map(pair => <tr key={pair[0].index}>
                    <td>{usedBy(pair[0].index).map(label => <span key={label} className='pin__label'>{label}</span>)}</td>
                    <td>{pair[0].features.map(f => <span key={f} className={featClassName(pair[0], f)}>{f}</span>)}</td>
                    <td>{pair[0].index}</td>
                    <td>{pair[1].index}</td>
                    <td>{pair[1].features.map(f => <span key={f} className={featClassName(pair[1], f)}>{f}</span>)}</td>
                    <td>{usedBy(pair[1].index).map(label => <span key={label} className='pin__label'>{label}</span>)}</td>
                </tr>)}
            </tbody>
        </table>
    </div>
}