import { ComponentProps } from 'react';
import Link from 'next/link';

type LinkButtonProps = ComponentProps<'button'> &
  Omit<ComponentProps<typeof Link>, 'href'> &
  Partial<Pick<ComponentProps<typeof Link>, 'href'>>;

const LinkButton = <TComponent = 'button',>({ children, ...props }: LinkButtonProps) =>
  !props.disabled && props.href ? (
    <Link {...props} href={props.href}>
      <button {...props}>{children}</button>
    </Link>
  ) : (
    <button {...props}>{children}</button>
  );

export { LinkButton };
export type { LinkButtonProps };
