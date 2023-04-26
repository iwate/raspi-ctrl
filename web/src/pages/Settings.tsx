import { useCallback, useEffect, useState } from 'react';
import CtrlAnalogPad from '../components/CtrlAnalogPad';
import CtrlButton from '../components/CtrlButton';
import CtrlCrown from '../components/CtrlCrown';
import { CrtlLED } from '../components/CtrlLED';
import CtrlSlider from '../components/CtrlSlider';
import { CtrlAnalogPadOptions, CtrlButtonOptions, CtrlCrownOptions, CtrlLEDOptions, CtrlSliderOptions, Settings, Direction, ButtonColors, LEDColors, PinFeature } from '../types';
import './Settings.css'

import ReactFlow, { addEdge, Node, OnConnect, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow, useViewport } from 'reactflow';
import 'reactflow/dist/style.css';
import RaspiNode from '../nodes/RaspiNode';
import DriverHBridgeNode from '../nodes/DriverHBridgeNode';
import CtrlButtonNode from '../nodes/CtrlButtonNode';
import DriverPWMHBridgeNode from '../nodes/DriverPWMHBridgeNode';
import DriverSteppingNode from '../nodes/DriverSteppingNode';
import DriverInputNode from '../nodes/DriverInputNode';
import CtrlSliderNode from '../nodes/CtrlSliderNode';
import CtrlCrownNode from '../nodes/CtrlCrownNode';
import CtrlAnalogPadNode from '../nodes/CtrlAnalogPadNode';
import CtrlLEDNode from '../nodes/CtrlLEDNode';
import CalcAbsNode from '../nodes/CalcAbsNode';
import CalcLtNode from '../nodes/CalcLtNode';
import CalcGtNode from '../nodes/CalcGtNode';
import CalcNotNode from '../nodes/CalcNotNode';
import { Raspi4Pins } from '../raspi4';
import DriverOutputNode from '../nodes/DriverOutputNode';

const nodeTypes = { 
    raspi: RaspiNode,
    driver_hbridge: DriverHBridgeNode,
    driver_pwmhbridge: DriverPWMHBridgeNode,
    driver_stepping: DriverSteppingNode,
    driver_output: DriverOutputNode,
    driver_input: DriverInputNode,
    ctrl_button: CtrlButtonNode,
    ctrl_slider: CtrlSliderNode,
    ctrl_crown: CtrlCrownNode,
    ctrl_analogpad: CtrlAnalogPadNode,
    ctrl_led: CtrlLEDNode,
    calc_abs: CalcAbsNode,
    calc_lt: CalcLtNode,
    calc_gt: CalcGtNode,
    calc_not: CalcNotNode,
};
const raspiNode: Node = { id: '0', position: { x: 0, y: 200 }, data: { label: 'raspi' }, type: 'raspi', deletable: false };
const initialSettings: Settings = {
    ctrlSize:{ width:844, height:390 },
    nodes: [ raspiNode ],
    edges: [],
    drivers: [],
    code: {}
}
const initialCode = (type: string|undefined) => {
    if (!type)
        return '';
    let p = ''
    if (type === 'ctrl_button') p = ', { press }';
    else if (type === 'ctrl_slider') p = ', { value }';
    else if (type === 'ctrl_crown') p = ', { value }';
    else if (type === 'ctrl_analogpad') p = ', { x, y }';
    else if (type === 'driver_input') p = ', { out }';
    return `(async function(ctx${p}) {
    /*
        await ctx.act([
            ['hbriidge driver label', { in1: true, in2: false }],
            ['pwm hbriidge driver label', { in1: true, in2: false, duty: 0.5 }],
            ['hbriidge driver label', { in1: true, in2: false }],
        ]);
        await ctx.act([
            ['FrontR', { in1: true, in2: false, duty: 1.0 }],
            ['FrontL', { in1: true, in2: false, duty: 1.0 }],
            ['RearR', { in1: true, in2: false, duty: 1.0 }],
            ['RearL', { in1: true, in2: false, duty: 1.0 }]
        ]);
    */
})`;
}
function SettingsPage() {
    const [tab, setTab] = useState('ctrl');
    const [ctrlSize, setCtrlSize] = useState(initialSettings.ctrlSize);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialSettings.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialSettings.edges);
    const onConnect: OnConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const ctrls = nodes.filter(n => n.type?.startsWith('ctrl_') === true);
    const inputDrivers = nodes.filter(n => n.type?.startsWith('driver_input') === true);
    const removeNode = (node: Node) => setNodes(nds => nds.filter(n => n.id !== node.id));
    const changeNode = (node: NodePartial<any>) => setNodes(nds => nds.map(n => {
        if (n.id === node.id) {
            for(let entry of Object.entries(node.data)) {
                n.data[entry[0]] = entry[1];
            }
        }
        return n;
    }));
    const none = () => {}
    const restart = () => fetch('/restart', { method: 'post' });
    const [editId, setEditId] = useState<string>('');
    const [code, setCode] = useState<{[key:string]:string}>({});
    useEffect(() => {
        fetch('/settings.json').then(res => res.json()).then((settings: Settings) => {
            setNodes(() => [raspiNode].concat(settings.nodes.filter(n => n.id !== raspiNode.id)));
            setEdges(() => settings.edges);
            setCtrlSize(settings.ctrlSize);
            setCode(settings.code)
        })
    },[])
    return <ReactFlowProvider>
        <div className='settings'>
            <header>
                <h1>Settings</h1>
                <label><input type="radio" name="tab" value="ctrl" checked={tab === 'ctrl'}  onChange={e => setTab(e.currentTarget.value)}/>Controller</label>
                <label><input type="radio" name="tab" value="flow" checked={tab === 'flow'} onChange={e => setTab(e.currentTarget.value)}/>Driver</label>
                <label><input type="radio" name="tab" value="code" checked={tab === 'code'} onChange={e => setTab(e.currentTarget.value)}/>Code</label>
                <SaveButton ctrlSize={ctrlSize} code={code}/>
                <button onClick={restart}>Restart</button>
            </header>
            <main>
                <div style={{ width: '100vw', height: '100vh' }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                    >
                        <SettingsFlowToolbar/>
                        {tab==='ctrl'&&(
                            <section style={{position:'relative', top:0, left:0, background: '#242424', zIndex: 4}}>
                                <SettingsCtrlToolbar/>
                                <div className='settings__list'>
                                    <ul>
                                        <li>
                                            <dt>Device</dt>
                                            <dd>
                                                <label>width:</label>
                                                <input type="number" value={ctrlSize.width} 
                                                    onChange={e => setCtrlSize({...ctrlSize, width: e.currentTarget.valueAsNumber})}/>

                                                <label>height:</label> 
                                                <input type="number" value={ctrlSize.height} 
                                                    onChange={e => setCtrlSize({...ctrlSize, height: e.currentTarget.valueAsNumber})}/>
                                            </dd>
                                        </li>
                                        {ctrls.map((ctrl, i) => {
                                            return <li key={ctrl.id}>
                                                <button type="button" className="btn-close" onClick={() => removeNode(ctrl)}>&times;</button>
                                                {
                                                    (() => {switch(ctrl.type) {
                                                        case "ctrl_button": return <SettingsCtrlButton ctrl={ctrl} onChange={changeNode}/>
                                                        case "ctrl_slider": return <SettingsCtrlSlider ctrl={ctrl} onChange={changeNode}/>
                                                        case "ctrl_crown": return <SettingsCtrlCrown ctrl={ctrl} onChange={changeNode}/>
                                                        case "ctrl_analogpad": return <SettingsCtrlAnalogPad ctrl={ctrl} onChange={changeNode}/>
                                                        case "ctrl_led": return <SettingsCtrlLED ctrl={ctrl} onChange={changeNode}/>
                                                        default: return <div></div>
                                                    }})()
                                                }
                                            </li>
                                        })}
                                    </ul>
                                </div>
                                <div className='settings__ctrls-preview'>
                                    <div className="ctrl-container" style={{
                                        width: Number.isNaN(ctrlSize.width) ? 1: ctrlSize.width,
                                        height: Number.isNaN(ctrlSize.height) ? 1: ctrlSize.height,
                                        }}>
                                        {ctrls.map((ctrl) => {
                                            switch(ctrl.type) {
                                                case "ctrl_button": return <CtrlButton {...ctrl.data} onAction={none} key={ctrl.id}/>
                                                case "ctrl_slider": return <CtrlSlider {...ctrl.data} onAction={none}  key={ctrl.id}/>
                                                case "ctrl_crown": return <CtrlCrown {...ctrl.data} onAction={none}  key={ctrl.id}/>
                                                case "ctrl_analogpad": return <CtrlAnalogPad {...ctrl.data} onAction={none}  key={ctrl.id}/>
                                                case "ctrl_led": return <CrtlLED {...ctrl.data} value={true}  key={ctrl.id}/>
                                                default: return <div></div>
                                            }
                                        })}
                                    </div>
                                </div>
                            </section>
                        )}
                        {tab==='code'&&(
                            <section style={{position:'relative', top:0, left:0, background: '#242424', zIndex: 4}}>
                                <div className="settings__list">
                                    <ul>
                                        {ctrls.filter(ctrl => ctrl.type != 'ctrl_led').concat(inputDrivers).map(node => (
                                            <li key={node.id}>
                                                {node.data.label}
                                                {editId!==node.id&&(
                                                    <button onClick={()=>setEditId(node.id)}>Edit</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="settings__code">
                                    <textarea 
                                        value={code[editId]||initialCode(nodes.find(n=>n.id==editId)?.type)} 
                                        onKeyDown={e => {
                                            if (e.key === "Tab") {
                                                e.preventDefault();
                                                /*
                                                const value = e.currentTarget.value;
                                                const sp = e.currentTarget.selectionStart;
                                                const ep = e.currentTarget.selectionEnd;
                                                const result = value.slice(0, sp) + '\t' + value.slice(ep);
                                                setCode({...code,[editId]:result});
                                                const np = sp + 1;
                                                e.currentTarget.setSelectionRange(np, np);
                                                */
                                                return false;
                                            }
                                        }}
                                        onInput={e => setCode({...code,[editId]:e.currentTarget.value})}></textarea>
                                </div>
                            </section>
                        )}
                    </ReactFlow>
                </div>
            </main>
        </div>
    </ReactFlowProvider>
}

export default SettingsPage;

const featureMap: {[k:string]:PinFeature[]} = {
    "driver_hbridge:pin1": ["out"],
    "driver_hbridge:pin2": ["out"],
    "driver_hbridge:limit1": ["in"],
    "driver_hbridge:limit2": ["in"],
    "driver_pwmhbridge:pin1": ["out"],
    "driver_pwmhbridge:pin2": ["out"],
    "driver_pwmhbridge:limit1": ["in"],
    "driver_pwmhbridge:limit2": ["in"],
    "driver_pwmhbridge:pwm": ["pwm0", "pwm1"],
    "driver_stepping:dir": ["out"],
    "driver_stepping:clk": ["clk0","clk1","clk2"],
    "driver_stepping:limit1": ["in"],
    "driver_stepping:limit2": ["in"],
    "driver_input:pin": ["in"],
    "driver_output:pin": ["out"],
}
function SaveButton(props: {ctrlSize:{width:number, height: number}, code: {[key:string]:string}}) {
    const instance = useReactFlow();
    const onClick = () => {
        const nodes = instance.getNodes();
        const edges = instance.getEdges();
        const pins = Raspi4Pins.map(p => {
            const features = edges.filter(d => d.target === '0' && d.targetHandle === String(p.index)).flatMap(d => {
                const node = nodes.find(n => n.id == d.source);
                return featureMap[`${node?.type}:${d.sourceHandle}`];
            });
            return {
                ...p,
                features: p.features.filter(f => features.includes(f))
            }
        }).filter(p => p.features.length > 0);
        
        if (pins.some(p => p.features.length > 1)) {
            for(let p of pins.filter(p => p.features.length > 1)) {
                alert(`Raspi #${p.index} pin is set multiple feature. ${p.features.join('/')}`);
            }
        }
        else {
            const data = {
                ctrlSize: props.ctrlSize,
                nodes,
                edges,
                pins: pins.map(p => ({
                    index: p.index,
                    gpio: p.gpio,
                    feature: p.features[0]
                })),
                drivers: nodes.filter(n => n.type?.startsWith('driver_') === true).map(n => ({
                    id: n.id,
                    type: n.type,
                    ...Object.fromEntries(edges.filter(d => d.source === n.id && d.target === '0').map(d => [d.sourceHandle, Number(d.targetHandle)]))
                })),
                code: Object.fromEntries(Object.entries(props.code).map(entry => [entry[0], entry[1]||initialCode(nodes.find(n=>n.id===entry[0])?.type)]))
            }
            console.log(JSON.stringify(data));
            fetch('/save', {
                method: 'post',
                body: JSON.stringify(data)
            }).then(res => {
                if(res.ok) {
                    alert('Saved');
                }
            })
        }
    }
    return <button onClick={onClick}>Save</button>
}

let counter = 0;
function createId() {
    return `${new Date().getTime()}:${++counter}`
}

function SettingsCtrlToolbar() {
    const { x, y, zoom } = useViewport();
    const { addNodes } = useReactFlow();
    const addLED = () => {
        const id = createId();
        addNodes([{
            id,
            position: { x: -x/zoom + 100, y: -y/zoom + 100 },
            data: { 
                label: `LED${id}`,
                cx: 100,
                cy: 100,
                color: 'green'
            },
            type: 'ctrl_led'
        }])
    }
    const addButton = () => {
        const id = createId();
        addNodes([{
            id,
            position: { x: -x/zoom + 100, y: -y/zoom + 100 },
            data: { 
                label: `Button${id}`,
                cx: 100,
                cy: 100,
                r: 5,
                color: 'black',
                symbol: `B`
            },
            type: 'ctrl_button'
        }]);
    }
    const addSlider = () => {
        const id = createId();
        addNodes([{
            id,
            position: { x: -x/zoom + 100, y: -y/zoom + 100 },
            data: { 
                label: `Slider${id}`,
                cx: 100,
                cy: 100,
                r: 15,
                dir: 'vertical',
                momentary: true
            },
            type: 'ctrl_slider'
        }]);
    }
    const addCrown = () => {
        const id = createId();
        addNodes([{
            id,
            position: { x: -x/zoom + 100, y: -y/zoom + 100 },
            data: { 
                label: `Crown${id}`,
                cx: 100,
                cy: 100,
                r: 30,
                max: 3
            },
            type: 'ctrl_crown'
        }]);
    }
    const addAnalogPad = () => {
        const id = createId();
        addNodes([{
            id,
            position: { x: -x/zoom + 100, y: -y/zoom + 100 },
            data: { 
                label: `AnalogPad${id}`,
                cx: 100,
                cy: 100,
                r: 6
            },
            type: 'ctrl_analogpad'
        }]);
    }
    return <div style={{ position: 'absolute', left: 0, top: 0, zIndex: 4 }}>
        <button onClick={addLED}>+ LED</button>
        <button onClick={addButton}>+ Button</button>
        <button onClick={addSlider}>+ Slider</button>
        <button onClick={addCrown}>+ Crown</button>
        <button onClick={addAnalogPad}>+ AnalogPad</button>
    </div>
}

function SettingsFlowToolbar() {
    const { x, y, zoom } = useViewport();
    const { addNodes } = useReactFlow();
    const addHBridge = () => {
        const id = createId();
        addNodes([{
            id,
            position: { x: -x/zoom + 100, y: -y/zoom + 100 },
            data: { label: `Driver${id}` },
            type: 'driver_hbridge'
        }]);
    }
    const addPWMHBridge = () => {
        const id = createId();
        addNodes([{
            id,
            position: { x: -x/zoom + 100, y: -y/zoom + 100 },
            data: { label: `Driver${id}` },
            type: 'driver_pwmhbridge'
        }]);
    }
    const addStepping = () => {
        const id = createId();
        addNodes([{
            id,
            position: { x: -x/zoom + 100, y: -y/zoom + 100 },
            data: { label: `Driver${id}` },
            type: 'driver_stepping'
        }]);
    }
    const addOutput = () => {
        const id = createId();
        addNodes([{
            id,
            position: { x: -x/zoom + 100, y: -y/zoom + 100 },
            data: { label: `Driver${id}` },
            type: 'driver_output'
        }]);
    }
    const addInput = () => {
        const id = createId();
        addNodes([{
            id,
            position: { x: -x/zoom + 100, y: -y/zoom + 100 },
            data: { label: `Driver${id}` },
            type: 'driver_input'
        }]);
    }
    const addNot = () => {
        const id = createId();
        addNodes([{
            id,
            position: { x: -x/zoom + 100, y: -y/zoom + 100 },
            data: { label: `Calc${id}` },
            type: 'calc_not'
        }]);
    }
    const addLt = () => {
        const id = createId();
        addNodes([{
            id,
            position: { x: -x/zoom + 100, y: -y/zoom + 100 },
            data: { label: `Calc${id}`, value: 0 as any},
            type: 'calc_lt'
        }]);
    }
    const addGt = () => {
        const id = createId();
        addNodes([{
            id,
            position: { x: -x/zoom + 100, y: -y/zoom + 100 },
            data: { label: `Calc${id}`, value: 0 as any },
            type: 'calc_gt'
        }]);
    }
    const addAbs = () => {
        const id = createId();
        addNodes([{
            id,
            position: { x: -x/zoom + 100, y: -y/zoom + 100 },
            data: { label: `Calc${id}` },
            type: 'calc_abs'
        }]);
    }
    return <div style={{ position: 'absolute', left: 10, top: 30, zIndex: 4 }}>
        <button onClick={addHBridge}>+ HBridge</button>
        <button onClick={addPWMHBridge}>+ HBridge(PWM)</button>
        <button onClick={addStepping}>+ Stepping</button>
        <button onClick={addOutput}>+ Output</button>
        <button onClick={addInput}>+ Input</button>
        <button onClick={addNot}>+ Not</button>
        <button onClick={addLt}>+ Lt</button>
        <button onClick={addGt}>+ Gt</button>
        <button onClick={addAbs}>+ Abs</button>
    </div>
}

type NodePartial<T> = { id: string, data: Partial<T> }
type SettingsCtrlProps<T> = {
    ctrl: Node<T>,
    onChange: (node: NodePartial<T>) => void
}

function SettingsCtrlLED(props: SettingsCtrlProps<CtrlLEDOptions>) {
    return <dl>
        <dt>Label</dt>
        <dd>
            <input type="text" value={props.ctrl.data.label} 
                onInput={e => props.onChange({ id: props.ctrl.id, data: { label: e.currentTarget.value }})}/>
        </dd>

        <dt>Position</dt>
        <dd>
            <label>cx:</label>
            <input type="number" value={Number.isNaN(props.ctrl.data.cx) ? '' : props.ctrl.data.cx} 
                onInput={e => props.onChange({ id: props.ctrl.id, data: { cx: e.currentTarget.valueAsNumber }})}/>

            <label>cy:</label>
            <input type="number" value={Number.isNaN(props.ctrl.data.cy) ? '' : props.ctrl.data.cy} 
                onInput={e => props.onChange({ id: props.ctrl.id, data: { cy: e.currentTarget.valueAsNumber }})}/>
        </dd>

        <dt>Color</dt>
        <dd>
            <select value={props.ctrl.data.color} onChange={e => props.onChange({ id: props.ctrl.id, data: { color: e.currentTarget.value as LEDColors }})}>
                <option>red</option>
                <option>blue</option>
                <option>yellow</option>
                <option>green</option>
            </select>
        </dd>
    </dl>
}

function SettingsCtrlButton(props: SettingsCtrlProps<CtrlButtonOptions>) {
    return <dl>
        <dt>Label</dt>
        <dd>
            <input type="text" value={props.ctrl.data.label} 
                onInput={e => props.onChange({ id: props.ctrl.id, data: { label: e.currentTarget.value }})}/>
        </dd>

        <dt>Symbol</dt>
        <dd>
            <input type="text" value={props.ctrl.data.symbol} 
                onInput={e => props.onChange({ id: props.ctrl.id, data: { symbol: e.currentTarget.value }})}/>
        </dd>

        <dt>Position</dt>
        <dd>
            <label>cx:</label>
            <input type="number" value={Number.isNaN(props.ctrl.data.cx) ? '' : props.ctrl.data.cx} 
                onInput={e => props.onChange({ id: props.ctrl.id, data: { cx: e.currentTarget.valueAsNumber }})}/>

            <label>cy:</label>
            <input type="number" value={Number.isNaN(props.ctrl.data.cy) ? '' : props.ctrl.data.cy} 
                onInput={e => props.onChange({ id: props.ctrl.id, data: { cy: e.currentTarget.valueAsNumber }})}/>
        </dd>

        <dt>R[mm]</dt>
        <dd>
            <input type="number" value={Number.isNaN(props.ctrl.data.r) ? '' : props.ctrl.data.r} 
                onInput={e => props.onChange({ id: props.ctrl.id, data: { r: e.currentTarget.valueAsNumber }})}/>
        </dd>

        <dt>Color</dt>
        <dd>
            <select value={props.ctrl.data.color} onChange={e => props.onChange({ id: props.ctrl.id, data: { color: e.currentTarget.value as ButtonColors }})}>
                <option>red</option>
                <option>blue</option>
                <option>yellow</option>
                <option>green</option>
                <option>black</option>
            </select>
        </dd>
    </dl>
}

function SettingsCtrlSlider(props: SettingsCtrlProps<CtrlSliderOptions>) {
    return <dl>
        <dt>Label</dt>
        <dd>
            <input type="text" value={props.ctrl.data.label} 
                onInput={e => props.onChange({ id: props.ctrl.id, data: { label: e.currentTarget.value }})}/>
        </dd>

        <dt>Direction</dt>
        <dd>
            <select value={props.ctrl.data.dir} onChange={e => props.onChange({ id: props.ctrl.id, data: { dir: e.currentTarget.value as Direction }})}>
                <option>vertical</option>
                <option>horizontal</option>
            </select>
        </dd>

        <dt>Position</dt>
        <dd>
            <label>cx:</label>
            <input type="number" value={Number.isNaN(props.ctrl.data.cx) ? '' : props.ctrl.data.cx} 
                onInput={e => props.onChange({ id: props.ctrl.id, data: { cx: e.currentTarget.valueAsNumber }})}/>

            <label>cy:</label>
            <input type="number" value={Number.isNaN(props.ctrl.data.cy) ? '' : props.ctrl.data.cy} 
                onInput={e => props.onChange({ id: props.ctrl.id, data: { cy: e.currentTarget.valueAsNumber }})}/>
        </dd>

        <dt>R[mm]</dt>
        <dd>
            <input type="number" value={Number.isNaN(props.ctrl.data.r) ? '' : props.ctrl.data.r} 
                onInput={e => props.onChange({ id: props.ctrl.id, data: { r: e.currentTarget.valueAsNumber }})}/>
        </dd>
    </dl>
}

function SettingsCtrlCrown(props: SettingsCtrlProps<CtrlCrownOptions>) {
    return <dl>
        <dt>Label</dt>
        <dd>
            <input type="text" value={props.ctrl.data.label} 
                onInput={e => props.onChange({ id: props.ctrl.id, data: { label: e.currentTarget.value }})}/>
        </dd>

        <dt>Position</dt>
        <dd>
            <label>cx:</label>
            <input type="number" value={Number.isNaN(props.ctrl.data.cx) ? '' : props.ctrl.data.cx} 
                onInput={e => props.onChange({ id: props.ctrl.id, data: { cx: e.currentTarget.valueAsNumber }})}/>

            <label>cy:</label>
            <input type="number" value={Number.isNaN(props.ctrl.data.cy) ? '' : props.ctrl.data.cy} 
                onInput={e => props.onChange({ id: props.ctrl.id, data: { cy: e.currentTarget.valueAsNumber }})}/>
        </dd>

        <dt>R[px]</dt>
        <dd>
            <input type="number" value={Number.isNaN(props.ctrl.data.r) ? '' : props.ctrl.data.r} 
                onInput={e => props.onChange({ id: props.ctrl.id, data: { r: e.currentTarget.valueAsNumber }})}/>
        </dd>
        
        <dt>Rolling Max</dt>
        <dd>
            <input type="number" value={Number.isNaN(props.ctrl.data.max) ? '' : props.ctrl.data.max} 
                onInput={e => props.onChange({ id: props.ctrl.id, data: { max: e.currentTarget.valueAsNumber }})}/>
        </dd>
    </dl>
}

function SettingsCtrlAnalogPad(props: SettingsCtrlProps<CtrlAnalogPadOptions>) {
    return <dl>
        <dt>Label</dt>
        <dd>
            <input type="text" value={props.ctrl.data.label} 
                onInput={e => props.onChange({ id: props.ctrl.id, data: { label: e.currentTarget.value }})}/>
        </dd>

        <dt>Position</dt>
        <dd>
            <label>cx:</label>
            <input type="number" value={Number.isNaN(props.ctrl.data.cx) ? '' : props.ctrl.data.cx} 
                onInput={e => props.onChange({ id: props.ctrl.id, data: { cx: e.currentTarget.valueAsNumber }})}/>

            <label>cy:</label>
            <input type="number" value={Number.isNaN(props.ctrl.data.cy) ? '' : props.ctrl.data.cy} 
                onInput={e => props.onChange({ id: props.ctrl.id, data: { cy: e.currentTarget.valueAsNumber }})}/>
        </dd>

        <dt>R[mm]</dt>
        <dd>
            <input type="number" value={Number.isNaN(props.ctrl.data.r) ? '' : props.ctrl.data.r} 
                onInput={e => props.onChange({ id: props.ctrl.id, data: { r: e.currentTarget.valueAsNumber }})}/>
        </dd>
    </dl>
}