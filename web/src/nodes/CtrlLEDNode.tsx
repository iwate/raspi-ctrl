import { ChangeEventHandler, memo, useCallback } from 'react';
import { Handle, useReactFlow, useStoreApi, Position, Connection } from 'reactflow';
import "./CtrlLEDNode.css";
import { useConnectionValidation } from './validations';

type NodeProps = {
    id: string
    data: {
        label: string
    }
}

function CtrlLEDNode({ id, data }: NodeProps) {
    const isValidConnection = useConnectionValidation();

    return (
        <>
            <div className="led-node__header">
                LED: {data.label}
            </div>
            <div className="led-node__body">
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <Handle type="source" position={Position.Bottom} id={`in`} className="led__in" isValidConnection={isValidConnection}/>
                                in (0/1)
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default memo(CtrlLEDNode);