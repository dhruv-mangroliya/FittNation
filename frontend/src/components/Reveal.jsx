import { useInView } from '../hooks/useInView';

/** Fades + lifts its children into view on scroll. */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children, ...rest }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      data-reveal=""
      className={`${className}${inView ? ' is-in' : ''}`}
      style={{ '--d': `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
