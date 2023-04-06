import { ChangeEventHandler, memo, useCallback } from 'react';
import { Handle, useReactFlow, useStoreApi, Position, Connection } from 'reactflow';
import "./CalcNode.css";
import { useConnectionValidation } from './validations';

type NodeProps = {
    id: string
    data: {
        label: string
    }
}

function CalcNotNode({ id, data }: NodeProps) {
    const isValidConnection = useConnectionValidation();
    return (
        <>
            <Handle type="target" position={Position.Top} id={`in`} className="calc__in"/>
            <div className="calc-node__header">
                out ← !in
            </div>
            <Handle type="source" position={Position.Bottom} id={`out`} className="calc__out" isValidConnection={isValidConnection}/>
        </>
    );
}

export default memo(CalcNotNode);