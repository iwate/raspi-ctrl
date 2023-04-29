import { FC, useRef, useState } from 'react';
import './CtrlAnalogPad.css';
import { Position, WithActionHandler } from './CtrlPart';

type Props = {
    id: string
    r: number,
    label: string
} & Position & WithActionHandler<{ id: string, x: number, y: number }>

const CtrlAnalogPad: FC<Props> = (props) => {
    // const root = useRef(null);
    const [p, setPoint] = useState({ x: 0, y: 0 });
    const onTouchStart:React.TouchEventHandler<HTMLDivElement> = (e) => {
        onTouchMove(e);
    }
    const onTouchMove:React.TouchEventHandler<HTMLDivElement>  = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const dx = rect.x + e.currentTarget.clientWidth/2 - e.touches[0].clientX;
        const dy = rect.y + e.currentTarget.clientHeight/2 - e.touches[0].clientY;
        const r = e.currentTarget.clientWidth / 2;
        const d = Math.min(Math.sqrt(dx*dx + dy*dy) / r, 1.0);
        const t = Math.atan2(dy, dx);
        const x = -d * Math.cos(t);
        const y = d * Math.sin(t);
        setPoint({ x, y });
        props.onAction({ id: props.id, x, y });
    }
    const onTouchEnd:React.TouchEventHandler<HTMLDivElement>  = (e) => {
        setPoint({ x: 0, y: 0 });
        props.onAction({ id: props.id, x:0, y:0 });
    }

    return <div className="ctrl-analogpad" style={{
                left: props.cx + 'px',
                top: props.cy + 'px',
            }}>
        <div className="ctrl-analogpad__outer">
            <div className="ctrl-analogpad__inner" style={{width: 2*props.r + 'mm', height: 2*props.r + 'mm'}}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div className="ctrl-analogpad__pad" style={{
                    width: props.r + 'mm', 
                    height: props.r + 'mm',
                    marginLeft: props.r * p.x + 'mm',
                    marginTop: props.r * -p.y + 'mm',
                }}></div>
            </div>
        </div>
        <label>{props.label} ({p.x.toFixed(2)}, {p.y.toFixed(2)})</label>
    </div>
}

export default CtrlAnalogPad;