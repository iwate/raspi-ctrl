import React, { ChangeEventHandler, memo } from 'react';
import { Handle, useReactFlow, useStoreApi, Position } from 'reactflow';
import { Raspi4Pins } from '../raspi4';
import { PinFeature, PinSpec } from '../types';
import "./RaspiNode.css";
import "../components/PinTable.css";

type NodeProps = {
  id: string
}

function RaspiNode({ id }: NodeProps) {
  const featClassName = (pin: PinSpec, f: PinFeature) => {
      const selecteds: string[] = []//using(pin.index);
      
      if (selecteds.length == 0 || !selecteds.includes(f))
          return 'pin__feature';
      
      if (selecteds.length == 1)
          return 'pin__feature pin__feature--selected'

      return 'pin__feature pin__feature--error'
  }
  const hasHandle = (pin: PinSpec) => {
    return pin.features.some(f => f === "in" || f === 'out' || f.startsWith('pwm') || f.startsWith('clk'))
  }
  return (
    <>
      <div className="raspi-node__header">
        Raspberry Pi
      </div>
      <div className="raspi-node__body pintable">
        <table>
            <tbody>
                {Array.from(twin(Raspi4Pins)).map(pair => <tr key={pair[0].index}>
                    <td>{hasHandle(pair[0]) && <Handle type="target" position={Position.Left} id={String(pair[0].index)} />}</td>
                    <td>{pair[0].features.map(f => <span key={f} className={featClassName(pair[0], f)}>{f}</span>)}</td>
                    <td>{pair[0].index}</td>
                    <td>{pair[1].index}</td>
                    <td>{pair[1].features.map(f => <span key={f} className={featClassName(pair[1], f)}>{f}</span>)}</td>
                    <td>{hasHandle(pair[1]) && <Handle type="target" position={Position.Right} id={String(pair[1].index)} />}</td>
                </tr>)}
            </tbody>
        </table>
      </div>
    </>
  );
}

function* twin<T>(array: T[]) {
  const max = array.length - (array.length % 2)
  for (let i = 0; i < max; i += 2) {
    yield [array[i], array[i + 1]]
  }
}

export default memo(RaspiNode);