import { Position } from './CtrlPart';
import { CtrlRect } from './CtrlRect';
import './CtrlLED.css';

type Props = {
    id: string
    color: 'red' | 'blue' | 'yellow' | 'green'
    label: string
    value: boolean
} & Position 

export function CrtlLED(props:Props){
    return <CtrlRect className={`ctrl-led ctrl-led-${props.color} ${props.value?'ctrl-led-on':''}`} cx={props.cx} cy={props.cy} deps={[props.label, props.cx, props.cy]}>
        <div className='ctrl-led__led'></div>
        <label>{props.label}</label>
    </CtrlRect>
}