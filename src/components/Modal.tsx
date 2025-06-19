import { useRouterState } from "@tanstack/react-router";
import {
  createContext,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
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
  const { location } = useRouterState();

  const [portal, setPortal] = useState<HTMLElement>();
  const [content, setContent] = useState<ReactNode>(null);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const open = useCallback((element: ReactNode) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setContent(element);
    dialogRef.current?.showModal();
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const handleClose = useCallback(() => {
    timeoutRef.current = setTimeout(() => setContent(null), 1000);
  }, []);

  useLayoutEffect(() => {
    setPortal(document.body);
    return () => {
      setPortal(undefined);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (dialogRef.current?.open) {
        dialogRef.current.close();
      }
    };
  }, [location.pathname]);

  return (
    <ModalContext value={{ open, close }}>
      {children}
      {portal &&
        createPortal(
          <dialog
            className="modal modal-bottom md:modal-middle has-[.alert]:modal-middle"
            onClose={handleClose}
            ref={dialogRef}
          >
            <div className="modal-box has-[.alert]:p-0">{content}</div>
          </dialog>,
          portal
        )}
    </ModalContext>
  );
};
