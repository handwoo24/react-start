import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useReducer } from "react";
import { FormattedMessage } from "react-intl";
import { useModal } from "~/components/Modal";
import { useToast } from "~/components/Toast";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const modal = useModal();
  const toast = useToast();

  const [count, increment] = useReducer((prev) => prev + 1, 1);

  const handleAlert = useCallback(() => {
    modal.open(
      <div role="alert" className="alert alert-vertical">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="stroke-info h-6 w-6 shrink-0"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <div>
          <h3 className="font-bold">New message!</h3>
          <div className="text-xs">You have 1 unread message</div>
        </div>
        <button className="btn btn-sm" onClick={modal.close}>
          See
        </button>
      </div>
    );
  }, [modal]);

  const handleModal = useCallback(() => {
    modal.open(
      <div>
        <h3 className="font-bold text-lg">Hello!</h3>
        <p className="py-4">Press ESC key or click the button below to close</p>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn">Close</button>
          </form>
        </div>
      </div>
    );
  }, []);

  const handleToast = useCallback(() => {
    toast.push(<div className="alert alert-info">{count}번째 토스트</div>);
    increment();
  }, [toast, count]);

  return (
    <div className="p-2">
      <h3>
        <FormattedMessage id="title" />
      </h3>
      <button className="btn-warning btn" onClick={handleAlert}>
        alert
      </button>
      <button className="btn-error btn" onClick={handleModal}>
        modal
      </button>
      <button className="btn btn-info" onClick={handleToast}>
        toast
      </button>
    </div>
  );
}
