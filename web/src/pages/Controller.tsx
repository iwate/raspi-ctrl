import { FC, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edge, Node } from "reactflow"
import CtrlAnalogPad from '../components/CtrlAnalogPad';
import CtrlButton from '../components/CtrlButton';
import CtrlCrown from '../components/CtrlCrown';
import { CrtlLED } from '../components/CtrlLED';
import CtrlSlider from '../components/CtrlSlider';
import { Settings } from '../types';
import './Controller.css';

const initialSettings: Settings = {
    ctrlSize: { width: 844, height: 390 },
    nodes: [
        { id: '0', position: { x: 0, y: 200 }, data: { label: 'raspi' }, type: 'raspi', deletable: false },
    ],
    drivers: [],
    edges: [],
    code: {}
}
/*
function createFlow(settings: Settings, setDriverValue: (id: string, handle: string, value: any) => void) {
    const flowMap: { [k: string]: (value: any) => void } = {};
    const ctrls = settings.nodes.filter(n => n.type?.startsWith('ctrl_') === true);
    for (let n of ctrls) {
        const closures = settings.edges.filter(d => d.source === n.id).map(d => createFlowFunction(settings, d.source, d.sourceHandle!, setDriverValue));
        flowMap[n.id] = function (value: any) {
            for (let f of closures) {
                if (f) {
                    f(value);
                }
            }
        }
    }
    return flowMap;
}
function createFlowFunction(settings: Settings, id: string, handle: string, setDriverValue: (id: string, handle: string, value: any) => void) {
    const edges = settings.edges.filter(d => d.source === id && d.sourceHandle === handle);
    const closures = edges.map(d => {
        const target = settings.nodes.find(n => n.id === d.target);
        if (target?.type?.startsWith('driver_') === true) {
            return function (value: any) {
                setDriverValue(d.target, d.targetHandle!, value[d.sourceHandle!]);
            }
        }
        else if (target?.type === 'calc_not') {
            const target = settings.nodes.find(n => n.id === d.target);
            const inner = target && createFlowFunction(settings, d.target, 'out', setDriverValue);
            return function (value: any) {
                if (inner) {
                    inner({ out: !value[d.sourceHandle!] });
                }
            }
        }
        else if (target?.type === 'calc_lt') {
            const target = settings.nodes.find(n => n.id === d.target);
            const inner = target && createFlowFunction(settings, d.target, 'out', setDriverValue);
            let pivot = Number(target?.data.value);
            if (pivot === undefined || pivot === null || Number.isNaN(pivot)) {
                pivot = 0;
            }
            return function (value: any) {
                if (inner) {
                    inner({ out: value[d.sourceHandle!] < pivot });
                }
            }
        }
        else if (target?.type === 'calc_gt') {
            const target = settings.nodes.find(n => n.id === d.target);
            const inner = target && createFlowFunction(settings, d.target, 'out', setDriverValue);
            let pivot = Number(target?.data.value);
            if (pivot === undefined || pivot === null || Number.isNaN(pivot)) {
                pivot = 0;
            }
            return function (value: any) {
                if (inner) {
                    inner({ out: value[d.sourceHandle!] > pivot });
                }
            }
        }
        else if (target?.type === 'calc_abs') {
            const target = settings.nodes.find(n => n.id === d.target);
            const inner = target && createFlowFunction(settings, d.target, 'out', setDriverValue);
            let pivot = Number(target?.data.value);
            if (pivot === undefined || pivot === null || Number.isNaN(pivot)) {
                pivot = 0;
            }
            return function (value: any) {
                if (inner) {
                    inner({ out: Math.abs(value[d.sourceHandle!]) });
                }
            }
        }
        return function () { }
    })
    return function (value: any) {
        for (let f of closures) {
            if (f) {
                f(value);
            }
        }
    }
}

type Driver = { type: 'driver_hbridge', id: string, in1: boolean, in2: boolean }
    | { type: 'driver_pwmhbridge', id: string, in1: boolean, in2: boolean, duty: number }
    | { type: 'driver_stepping', id: string, cwccw: boolean, freq: number }
    | { type: 'driver_output', id: string, in: boolean }
    | { type: 'driver_input', id: string, out: boolean }

function createDrivers(settings: Settings): { [key: string]: Driver } {
    const entries: [string, Driver][] = settings.nodes.filter(n => n.type?.startsWith('driver_') === true).map(n => {
        switch (n.type) {
            case 'driver_hbridge': return [n.id, { type: 'driver_hbridge', id: n.id, in1: false, in2: false } as Driver];
            case 'driver_pwmhbridge': return [n.id, { type: 'driver_pwmhbridge', id: n.id, in1: false, in2: false, duty: 0 } as Driver];
            case 'driver_stepping': return [n.id, { type: 'driver_stepping', id: n.id, cwccw: false, freq: 0 } as Driver];
            case 'driver_output': return [n.id, { type: 'driver_output', id: n.id, in: false } as Driver];
            case 'driver_input': return [n.id, { type: 'driver_input', id: n.id, out: false } as Driver];
        }
    }) as [string, Driver][]
    return Object.fromEntries(entries);
}
*/
let socket: WebSocket | null = null;
const state: { [key: string]: { [key: string]: number | boolean } } = {};
const actions:  { [key: string]: (ctx:any,a:any)=>Promise<void>} = {};

/*
let drivers: { [key: string]: Driver } = {};
let flow: { [k: string]: (value: any) => void } = {};
const queue: string[] = []
function updateDriverValue(id: string, handle: string, value: any) {
    console.log(handle, value)
    drivers[id][handle as keyof Driver] = value;
    queue.push(id);
}
function sendModified() {
    const ids = Object.keys(queue.splice(0).reduce((o: any, id) => { o[id] = id; return o; }, {}));
    const events = ids.map(id => drivers[id]);
    console.log(JSON.stringify(events))
    socket?.send(JSON.stringify(events))
}
*/
function wait(ms: number) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    })
}
type Props = {
    w: number
    h: number
}

const Controller: FC<Props> = (props) => {
    const [connection, setConnection] = useState<boolean>(false);
    const [settings, setSettings] = useState<Settings>(initialSettings);
    const ctrls = settings.nodes.filter(n => n.type?.startsWith('ctrl_') === true);
    const el = useRef<HTMLDivElement>(null);
    const requestFullscreen = () => {
        el.current?.requestFullscreen();
        window.screen.orientation?.lock('landscape');
    }
    const stateMap = ctrls.concat(settings.nodes.filter(n => n.type == 'driver_input')).reduce((o:any, d) => {o[d.id] = d.data.label; return o; }, {});
    const driverMap = settings.nodes.filter(n => n.type?.startsWith('driver_') === true).reduce((o:any, d) => {o[d.data.label] = {id:d.id, type:d.type}; return o; }, {});
    const act = (batch: [label: string, data: any][]) => {
        const payload = batch.map(([label, data])=> ({...driverMap[label], ...data}));
        console.log(payload)
        socket?.send(JSON.stringify(payload))
    }
    const [state, setState] = useState<{[key:string]:any}>({});
    const update = (batch: [label: string, data: any][]) => {
        for (const [label, data] of batch) {
            const id = ctrls.find(n => n.data.label === label)?.id;
            if (id) {
                setState({...state, [id]: {...(state[id]??{}), ...data} })
            }
        }
    }
    useEffect(() => {
        fetch('/settings.json').then(res => res.json()).then(data => {
            console.log('init');
            // drivers = createDrivers(data);
            // flow = createFlow(data, updateDriverValue);
            for (let [id, code] of Object.entries(data.code)) {
                actions[id] = eval(code as string);
            }
            setSettings(data);
        })
        if (location.port !== '5173') {
            socket = new WebSocket('ws://' + location.host + '/ws');
            socket.onopen = function () {
                setConnection(true);
            };
            socket.onclose = function () {
                socket = null;
                setConnection(false);
            }
            socket.onmessage = function (ev) {
                console.log(ev.data);
            }
            socket.onerror = function () {
                socket?.close();
                socket = null;
                setConnection(false);
            }
        }
        else {
            setConnection(true);
        }
        return function cleanup() {
            socket?.close();
        };
    }, [setSettings])
    const onAction = async (arg: any) => {
        console.log(arg)
        state[stateMap[arg.id]] = arg;
        await actions[arg.id]({
            state,
            act,
            update,
            wait
        }, arg);
    }
    return <>
        <div ref={el} className="ctrl-container" style={{ width: props.w, height: props.h }}>
            {ctrls.map((ctrl) => {
                switch (ctrl.type) {
                    case "ctrl_button": return <CtrlButton id={ctrl.id} {...ctrl.data} onAction={onAction} key={ctrl.id} />
                    case "ctrl_slider": return <CtrlSlider id={ctrl.id} {...ctrl.data} onAction={onAction} key={ctrl.id} />
                    case "ctrl_crown": return <CtrlCrown id={ctrl.id} {...ctrl.data} onAction={onAction} key={ctrl.id} />
                    case "ctrl_analogpad": return <CtrlAnalogPad id={ctrl.id} {...ctrl.data} onAction={onAction} key={ctrl.id} />
                    case "ctrl_led": return <CrtlLED id={ctrl.id} {...ctrl.data} value={state[ctrl.id]?.value} key={ctrl.id} />
                    default: return <div></div>
                }
            })}
            {connection && <div className="connection-status">connected</div>}
            {!connection && <button type="button" className="reconnect-btn" onClick={() => location.reload()}>Reconnect</button>}
        </div>
        <button type="button" className="fullscreen-btn" onClick={requestFullscreen}>FullScreen</button>
        <Link to="/settings" className="settings-btn">Settings</Link>
    </>
}

export default Controller;