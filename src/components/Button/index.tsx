import { forwardRef } from "react";

type ButtonProps = React.HTMLProps<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
   (props, ref) => (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <button {...(props as any)} ref={ref}>
         {props.children}
      </button>
   )
);
