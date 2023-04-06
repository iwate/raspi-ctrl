import { ChangeEventHandler, memo, useCallback } from 'react';
import { Handle, useReactFlow, useStoreApi, Position, Connection } from 'reactflow';
import "./CtrlAnalogPadNode.css";
import { useConnectionValidation } from './validations';

type NodeProps = {
    id: string
    data: {
        label: string
    }
}

function CtrlAnalogPadNode({ id, data }: NodeProps) {
    const isValidConnection = useConnectionValidation();

    return (
        <>
            <div className="analogpad-node__header">
                Analog Pad: {data.label}
            </div>
            <div className="analogpad-node__body">
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <Handle type="source" position={Position.Bottom} id={`x`} className="analogpad__x" isValidConnection={isValidConnection}/>
                                x (-1.0 ~ 1.0) 
                            </td>
                            <td>
                                <Handle type="source" position={Position.Bottom} id={`y`} className="analogpad__y" isValidConnection={isValidConnection}/>
                                y (-1.0 ~ 1.0) 
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default memo(CtrlAnalogPadNode);