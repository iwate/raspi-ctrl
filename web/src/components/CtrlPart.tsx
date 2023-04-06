
export type Position = {
    cx: number
    cy: number
}

export type ActionHandler<ActionProps> = (props:ActionProps) => void;

export type WithActionHandler<ActionProps> = {
    onAction: ActionHandler<ActionProps>
}

export function toPx(mm:number) {
    return 96 / 25.4 * mm;
}