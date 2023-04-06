import { ChangeEventHandler, memo, useCallback } from 'react';
import { Handle, useReactFlow, useStoreApi, Position, Connection } from 'reactflow';
import "./CalcNode.css";
import { useConnectionValidation } from './validations';

type NodeProps = {
    id: string
    data: {
        value: number
    }
}

function CalcLtNode({ id, data }: NodeProps) {
    const { setNodes } = useReactFlow();
    const store = useStoreApi();
    const onChange: ChangeEventHandler<HTMLInputElement> = useCallback((evt) => {
        const { nodeInternals } = store.getState();
        setNodes(
            Array.from(nodeInternals.values()).map((node) => {
                if (node.id === id) {
                    node.data = {
                        ...node.data,
                        value: evt.currentTarget.value
                    };
                }
                return node;
            })
        );
    }, []);
    const isValidConnection = useConnectionValidation();

    return (
        <>
            <Handle type="target" position={Position.Top} id={`in`} className="calc__in"/>
            <div className="calc-node__header">
                out ← in &lt; <input type="number" name="value" onChange={onChange} className="nodrag" value={data.value}/>
            </div>
            <Handle type="source" position={Position.Bottom} id={`out`} className="calc__out" isValidConnection={isValidConnection}/>
        </>
    );
}

export default memo(CalcLtNode);