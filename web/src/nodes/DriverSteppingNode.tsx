import { ChangeEventHandler, memo, useCallback } from 'react';
import { Handle, useReactFlow, useStoreApi, Position, Connection } from 'reactflow';
import "./DriverSteppingNode.css";
import { useConnectionValidation } from './validations';

type NodeProps = {
    id: string
    data: {
        label: string
    }
}

function DriverSteppingNode({ id, data }: NodeProps) {
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
                        <Handle type="target" position={Position.Top} id={`cwccw`} className="stepping__cwccw" />
                        cw/ccw<br/>(0/1)
                        </td>
                        <td align='center'>
                        <Handle type="target" position={Position.Top} id={`freq`} className="stepping__freq"/>
                        freq rate<br/>(0.0 ~ 1.0)
                        </td>
                    </tr>
                </tbody>
            </table>
            <div className="stepping-node__header">
                Stepping: <input id="text" name="text" onChange={onChange} className="nodrag" placeholder='Label' value={data.label} />
            </div>
            <table>
                <tbody>
                    <tr>
                        <td>
                            <Handle type="source" position={Position.Bottom} id={`dir`} className="stepping__dir" isValidConnection={isValidConnection}/>
                            dir
                        </td>
                        <td>
                            <Handle type="source" position={Position.Bottom} id={`clk`} className="stepping__clk" isValidConnection={isValidConnection}/>
                            clk
                        </td>
                        <td>
                            <Handle type="source" position={Position.Bottom} id={`limit1`} className="stepping__limit1" isValidConnection={isValidConnection}/>
                            limit 1
                        </td>
                        <td>
                            <Handle type="source" position={Position.Bottom} id={`limit2`} className="stepping__limit2" isValidConnection={isValidConnection}/>
                            limit 2
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    );
}

export default memo(DriverSteppingNode);