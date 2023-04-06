import { ChangeEventHandler, memo, useCallback } from 'react';
import { Handle, useReactFlow, useStoreApi, Position, Connection } from 'reactflow';
import "./CtrlSliderNode.css";
import { useConnectionValidation } from './validations';

type NodeProps = {
    id: string
    data: {
        label: string
    }
}

function CtrlSliderNode({ id, data }: NodeProps) {
    const isValidConnection = useConnectionValidation();

    return (
        <>
            <div className="slider-node__header">
                Slider: {data.label}
            </div>
            <div className="slider-node__body">
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <Handle type="source" position={Position.Bottom} id={`value`} className="slider__value" isValidConnection={isValidConnection}/>
                                value (-1.0 ~ 1.0)
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default memo(CtrlSliderNode);