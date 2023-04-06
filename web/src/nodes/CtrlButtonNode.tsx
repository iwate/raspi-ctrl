import { ChangeEventHandler, memo, useCallback } from 'react';
import { Handle, useReactFlow, useStoreApi, Position, Connection } from 'reactflow';
import "./CtrlButtonNode.css";
import { useConnectionValidation } from './validations';

type NodeProps = {
    id: string
    data: {
        label: string
    }
}

function CtrlButtonNode({ id, data }: NodeProps) {
    const isValidConnection = useConnectionValidation();

    return (
        <>
            <div className="button-node__header">
                Button: {data.label}
            </div>
            <div className="button-node__body">
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <Handle type="source" position={Position.Bottom} id={`press`} className="button__press" isValidConnection={isValidConnection}/>
                                press (0/1)
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default memo(CtrlButtonNode);