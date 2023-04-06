import { FC, useState } from 'react';
import './CtrlSlider.css';
import { Position, WithActionHandler, toPx } from './CtrlPart';
import { CtrlRect } from './CtrlRect';

type Props = {
    id: string
    dir: 'vertical'|'horizontal'
    r: number
    label: string
    momentary: boolean
} & Position & WithActionHandler<{ id: string, value: number }>

const CtrlSlider: FC<Props> = (props) => {
    const [p, setPoint] = useState({ x: 0, y: 0 });
    const width = props.dir === 'vertical' ? 8 : 2 * props.r;
    const height = props.dir === 'horizontal'? 8 : 2 * props.r;
    const pxR = toPx(props.r);
    const onTouchStart:React.TouchEventHandler<HTMLDivElement> = (e) => {
        onTouchMove(e);
    }
    const onTouchMove:React.TouchEventHandler<HTMLDivElement>  = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const dx = rect.x + e.currentTarget.clientWidth/2 - e.touches[0].clientX;
        const dy = rect.y + e.currentTarget.clientHeight/2 - e.touches[0].clientY;
        const d = Math.min(Math.sqrt(dx*dx + dy*dy) / pxR, 1.0);
        const t = Math.atan2(dy, dx);
        let x = props.dir === 'vertical' ? 0 : -d * Math.cos(t);
        let y = props.dir === 'horizontal'? 0 : d * Math.sin(t);
        if (!props.momentary && d < 0.1) {
            x = 0;
            y = 0;
        }
        setPoint({ x, y });
        props.onAction({ id: props.id, value: x||y });
    }
    const onTouchEnd:React.TouchEventHandler<HTMLDivElement>  = (e) => {
        if (props.momentary) {
            setPoint({ x: 0, y: 0 });
            props.onAction({ id: props.id, value: 0 });
        }
    }

    return <CtrlRect className="ctrl-slider" cx={props.cx} cy={props.cy} deps={[props.label, props.cx, props.cy, props.dir, props.r]}>
        <div className="ctrl-slider__inner" style={{
                width: width + 'mm', 
                height: height + 'mm'
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div className="ctrl-slider__pad" style={{
                width: '8mm', 
                height: '8mm',
                marginLeft: ((2 * props.r - 8) * p.x) + 'mm',
                marginTop: ((2 * props.r - 8) * -p.y) + 'mm',
            }}></div>
        </div>
        <label>{props.label}<br/>({(p.x||p.y).toFixed(2)})</label>
    </CtrlRect>
}

export default CtrlSlider;