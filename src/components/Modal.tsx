import {
  createContext,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const ModalContext = createContext<{
  open: (element: ReactNode) => void;
  close: () => void;
}>({
  open() {},
  close() {},
});

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }: PropsWithChildren) => {
  const [portal, setPortal] = useState<HTMLElement>();

  const dialogRef = useRef<HTMLDialogElement>(null);

  const [content, setContent] = useState<ReactNode>(null);

  const open = useCallback((element: ReactNode) => {
    setContent(element);
    dialogRef.current?.showModal();
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
    setContent(null);
  }, []);

  useLayoutEffect(() => {
    setPortal(document.body);
    return () => {
      setPortal(undefined);
    };
  }, []);

  return (
    <ModalContext value={{ open, close }}>
      {children}
      {portal &&
        createPortal(
          <dialog
            className="modal modal-bottom md:modal-middle"
            ref={dialogRef}
          >
            {content}
            <form method="dialog" className="modal-backdrop">
              <button />
            </form>
          </dialog>,
          portal
        )}
    </ModalContext>
  );
};
