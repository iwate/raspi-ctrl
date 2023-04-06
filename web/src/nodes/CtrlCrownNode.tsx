import { ChangeEventHandler, memo, useCallback } from 'react';
import { Handle, useReactFlow, useStoreApi, Position, Connection } from 'reactflow';
import "./CtrlCrownNode.css";
import { useConnectionValidation } from './validations';

type NodeProps = {
    id: string
    data: {
        label: string
    }
}

function CtrlCrownNode({ id, data }: NodeProps) {
    const isValidConnection = useConnectionValidation();

    return (
        <>
            <div className="crown-node__header">
                Crown: {data.label}
            </div>
            <div className="crown-node__body">
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <Handle type="source" position={Position.Bottom} id={`value`} className="crown__value" isValidConnection={isValidConnection}/>
                                value (0.0 ~ 1.0) 
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default memo(CtrlCrownNode);