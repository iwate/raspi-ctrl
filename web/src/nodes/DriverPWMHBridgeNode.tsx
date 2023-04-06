import { ChangeEventHandler, memo, useCallback } from 'react';
import { Handle, useReactFlow, useStoreApi, Position, Connection } from 'reactflow';
import "./DriverPWMHBridgeNode.css";
import { useConnectionValidation } from './validations';

type NodeProps = {
    id: string
    data: {
        label: string
    }
}

function DriverPWMHBridgeNode({ id, data }: NodeProps) {
    const { setNodes } = useReactFlow();
    const store = useStoreApi();
    const onChange: ChangeEventHandler<HTMLInputElement> = useCallback((evt) => {
        const { nodeInternals } = store.getState();
        setNodes(
            Array.from(nodeInternals.values()).map((node) => {
                if (node.id === id) {
                    node.data = {
                        ...node.data,
                        label: evt.currentTarget.value
                    };
                }
                return node;
            })
        );
    }, []);
    const isValidConnection = useConnectionValidation();

    return (
        <>
            <table>
                <tbody>
                    <tr>
                        <td align='center'>
                        <Handle type="target" position={Position.Top} id={`in1`} className="pwmhbridge__in1" />
                        in 1 (0/1)
                        </td>
                        <td align='center'>
                        <Handle type="target" position={Position.Top} id={`in2`} className="pwmhbridge__in2"/>
                        in 2 (0/1)
                        </td>
                        <td align='center'>
                        <Handle type="target" position={Position.Top} id={`duty`} className="pwmhbridge__duty"/>
                        duty rate(0.0 ~ 1.0)
                        </td>
                    </tr>
                </tbody>
            </table>
            <div className="pwmhbridge-node__header">
                HBridge(PWM): <input id="text" name="text" onChange={onChange} className="nodrag" placeholder='Label'  value={data.label} />
            </div>
            <table>
                <tbody>
                    <tr>
                        <td>
                            <Handle type="source" position={Position.Bottom} id={`pin1`} className="pwmhbridge__pin1" isValidConnection={isValidConnection}/>
                            pin 1
                        </td>
                        <td>
                            <Handle type="source" position={Position.Bottom} id={`pin2`} className="pwmhbridge__pin2" isValidConnection={isValidConnection}/>
                            pin 2
                        </td>
                        <td>
                            <Handle type="source" position={Position.Bottom} id={`pwm`} className="pwmhbridge__pwm" isValidConnection={isValidConnection}/>
                            pwm
                        </td>
                        <td>
                            <Handle type="source" position={Position.Bottom} id={`limit1`} className="pwmhbridge__limit1" isValidConnection={isValidConnection}/>
                            limit 1
                        </td>
                        <td>
                            <Handle type="source" position={Position.Bottom} id={`limit2`} className="pwmhbridge__limit2" isValidConnection={isValidConnection}/>
                            limit 2
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    );
}

export default memo(DriverPWMHBridgeNode);