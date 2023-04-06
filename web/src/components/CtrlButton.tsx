import { FC, useState } from 'react';
import './CtrlButton.css';
import { Position, WithActionHandler } from './CtrlPart';

type Props = {
    id: string
    color: 'red' | 'blue' | 'yellow' | 'green' | 'black'
    symbol: string
    label: string
    r: number
} & Position & WithActionHandler<{ id: string, press: boolean }>

const CtrlButton: FC<Props> = (props) => {
    const [isActive, setActive] = useState(false);
    const className = `ctrl-btn ctrl-btn-circle ctrl-btn-${props.color} ${isActive?'ctrl-btn--active':''}`;
    const onTouchStart = () => {
        setActive(true);
        props.onAction({ id: props.id, press: true });
    }
    const onTouchEnd = () => {
        setActive(false);
        props.onAction({ id: props.id, press: false });
    }
    return <div className={className} style={{
                left: props.cx + 'px',
                top: props.cy + 'px',
                marginLeft: -props.r + 'mm',
                marginTop: -props.r + 'mm',
            }}>
        <button type="button" className="ctrl-btn__button" style={{
                    width: props.r*2 + 'mm', 
                    height: props.r*2 + 'mm',
                }}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}>{props.symbol}</button>
        <label>{props.label}<br/>({isActive?'on':'off'})</label>
    </div>
}

export default CtrlButton;