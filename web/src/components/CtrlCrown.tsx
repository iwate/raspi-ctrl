import { FC, useEffect, useRef, useState } from 'react';
import './CtrlCrown.css'
import { Position, WithActionHandler } from './CtrlPart';
import { CtrlRect } from './CtrlRect';

type Props = {
    id: string
    r: number
    max:number
    label: string
} & Position & WithActionHandler<{ id: string, value: number }>


const CtrlCrown: FC<Props> = (props) => {
    const [value, setValue] = useState(0);
    const width = props.r / 3;
    const height = props.r;
    const [t, setTouchPoint] = useState({ x: 0, y: 0 });
    const onTouchStart:React.TouchEventHandler<HTMLDivElement> = (e) => {
        setTouchPoint({ 
            x: e.touches[0].clientX, 
            y: e.touches[0].clientY 
        });
    }
    const onTouchMove:React.TouchEventHandler<HTMLDivElement>  = (e) => {
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        const w = e.currentTarget.clientWidth;
        const h = e.currentTarget.clientHeight;
        const dx = Math.max(-w, Math.min(w, t.x - x));
        const dy = Math.max(-h, Math.min(h, t.y - y));
        const d = dy / (props.max * h);
        if (Math.abs(d) >= 0.01) {
            const v = Math.max(0, Math.min(1, value + d));
            setValue(v);
            setTouchPoint({ x, y });
            props.onAction({ id: props.id, value: v });
        }
    }
    const onTouchEnd:React.TouchEventHandler<HTMLDivElement>  = (e) => {
    }
    return <CtrlRect className="ctrl-crown" cx={props.cx} cy={props.cy} deps={[props.label, props.cx, props.cy, props.r]}>
        <div className="ctrl-crown__inner" style={{
                width: width + 'mm', 
                height: height + 'mm'
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div className="ctrl-crown__bar" style={{
                width: width + 'mm', 
                height: (height * value) + 'mm',
                backgroundColor: `hsl(${120*value},100%,50%)`
            }}></div>
        </div>
        <label>{props.label}<br/>({value.toFixed(2)})</label>
    </CtrlRect>
}

export default CtrlCrown;