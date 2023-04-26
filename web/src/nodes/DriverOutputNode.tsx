import { ChangeEventHandler, memo, useCallback } from 'react';
import { Handle, useReactFlow, useStoreApi, Position, Connection } from 'reactflow';
import "./DriverOutputNode.css";
import { useConnectionValidation } from './validations';

type NodeProps = {
    id: string
    data: {
        label: string
    }
}

function DriverOutputNode({ id, data }: NodeProps) {
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
                            <Handle type="target" position={Position.Top} id={`in`} className="output__in"/>
                            in
                        </td>
                    </tr>
                </tbody>
            </table>
            <div className="output-node__header">
                Output: <input id="text" name="text" onChange={onChange} className="nodrag" placeholder='Label' value={data.label} />
            </div>
            <table>
                <tbody>
                    <tr>
                        <td align='center'>
                            <Handle type="source" position={Position.Bottom} id={`pin`} className="input__pin" isValidConnection={isValidConnection} />
                            pin
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    );
}

export default memo(DriverOutputNode);