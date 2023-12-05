import { forwardRef } from "react";

type ButtonProps = React.HTMLProps<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
   (props, ref) => (
      <button
         style={{ cursor: "pointer", padding: 5 }}
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         {...(props as any)}
         ref={ref}
      >
         {props.children}
      </button>
   )
);
