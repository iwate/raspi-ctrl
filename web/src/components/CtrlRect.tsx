import { FC, useEffect, useRef, useState, ReactNode } from 'react';
import { Position } from './CtrlPart';
import './CtrlRect.css';

export const CtrlRect: FC<{ className: string,  children: ReactNode, deps: any[]} & Position> = (props) => {
    const root = useRef<HTMLDivElement>(null);
    const [rect, setRect] = useState({ width:200, height: 200});
    useEffect(() =>{
        setRect({ 
            width: root.current?.clientWidth||0, 
            height: root.current?.firstElementChild?.clientHeight||0,
        });
    }, props.deps)
    return <div ref={root} className={`ctrl-rect ${props.className}`} style={{
            left: props.cx + 'px',
            top: props.cy + 'px',
            marginLeft: -rect.width/2 + 'px',
            marginTop: -rect.height/2 + 'px',
        }}>
        {props.children}
    </div>
}