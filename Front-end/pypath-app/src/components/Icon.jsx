import { PATHS, SOCIAL } from './iconPaths';

/* <Icon name="home" /> renders the same inline <svg class="i"> the old PP.i('home') produced.
   box: wrap it in <span data-icon> like the old markup did (some CSS targets that wrapper). */
export default function Icon({ name, className = '', box = false, ...rest }) {
  if (SOCIAL[name]) {
    return <span data-icon={box ? name : undefined} style={box ? undefined : { display: 'contents' }} dangerouslySetInnerHTML={{ __html: SOCIAL[name] }} {...rest} />;
  }
  const svg = (
    <svg
      className={`i ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: PATHS[name] || PATHS.dot }}
    />
  );
  return box ? <span data-icon={name} {...rest}>{svg}</span> : svg;
}
