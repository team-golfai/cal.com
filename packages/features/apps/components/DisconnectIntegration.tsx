import { useState } from "react";

import { useIsPlatform, PlatformDisconnectIntegration } from "@calcom/atoms/monorepo";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import type { ButtonProps } from "@calcom/ui";
import { showToast, DisconnectIntegrationComponent } from "@calcom/ui";

export default function DisconnectIntegration(props: {
  credentialId: number;
  label?: string;
  slug?: string;
  trashIcon?: boolean;
  isGlobal?: boolean;
  onSuccess?: () => void;
  buttonProps?: ButtonProps;
}) {
  const isPlatform = useIsPlatform();

  return !isPlatform ? <WebDisconnectIntegration {...props} /> : <PlatformDisconnectIntegration {...props} />;
}

const WebDisconnectIntegration = (props: {
  credentialId: number;
  label?: string;
  trashIcon?: boolean;
  isGlobal?: boolean;
  onSuccess?: () => void;
  buttonProps?: ButtonProps;
}) => {
  const { t } = useLocale();
  const { onSuccess, credentialId } = props;
  const [modalOpen, setModalOpen] = useState(false);
  const utils = trpc.useUtils();

  const mutation = trpc.viewer.deleteCredential.useMutation({
    onSuccess: () => {
      showToast(t("app_removed_successfully"), "success");
      setModalOpen(false);
      onSuccess && onSuccess();
    },
    onError: () => {
      showToast(t("error_removing_app"), "error");
      setModalOpen(false);
    },
    async onSettled() {
      await utils.viewer.connectedCalendars.invalidate();
      await utils.viewer.integrations.invalidate();
    },
  });

  return (
    <DisconnectIntegrationComponent
      onDeletionConfirmation={() => mutation.mutate({ id: credentialId })}
      {...props}
      isModalOpen={modalOpen}
      onModalOpen={() => setModalOpen((prevValue) => !prevValue)}
    />
  );
};
