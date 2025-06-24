import {
  createContext,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { CSSTransition } from "react-transition-group";

const ToastContext = createContext<{ push: (message: ReactNode) => void }>({
  push() {},
});

interface ToastProps extends PropsWithChildren {
  timeout: number;
  classNames: string;
  onExited?: () => void;
}

const Toast = ({ children, timeout, classNames, onExited }: ToastProps) => {
  const [inProp, setInProp] = useState(true);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setInProp(false), timeout);
    return () => clearTimeout(id);
  }, [timeout]);

  return (
    <CSSTransition
      in={inProp}
      nodeRef={nodeRef}
      timeout={timeout}
      classNames={classNames}
      onExited={onExited}
    >
      <div ref={nodeRef}>{children}</div>
    </CSSTransition>
  );
};

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const [messages, setMessages] = useState<{ id: string; node: ReactNode }[]>(
    []
  );
  const [portal, setPortal] = useState<HTMLElement>();

  const push = useCallback((node: ReactNode) => {
    const id = Math.random().toString(36).substring(2, 9);
    setMessages((prev) => [...prev, { id, node }].slice(-3));
  }, []);

  const handleExited = useCallback(
    (id: string) => () =>
      setMessages((prev) => prev.filter((m) => m.id !== id)),
    []
  );

  useLayoutEffect(() => {
    setPortal(document.body);
    return () => setPortal(undefined);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      {portal &&
        createPortal(
          <div className="toast md:toast-desktop toast-mobile flex-col-reverse md:flex-col">
            {messages
              .slice()
              .reverse()
              .map(({ id, node }) => (
                <Toast
                  key={id}
                  timeout={2500}
                  classNames="toast-item"
                  onExited={handleExited(id)}
                >
                  {node}
                </Toast>
              ))}
          </div>,
          portal
        )}
    </ToastContext.Provider>
  );
};
