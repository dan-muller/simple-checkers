import { ComponentProps } from 'react';
import Link from 'next/link';

export const LinkButton = <TComponent = 'button',>({
    children,
    ...props
}: ComponentProps<'button'> &
    Omit<ComponentProps<typeof Link>, 'href'> &
    Partial<Pick<ComponentProps<typeof Link>, 'href'>>) =>
    !props.disabled && props.href ? (
        <Link {...props} href={props.href}>
            <button {...props}>{children}</button>
        </Link>
    ) : (
        <button {...props}>{children}</button>
    );
