import { Modal } from 'antd';
import type { FC } from 'react';

interface DocumentViewerModalProps {
  open: boolean;
  url: string;
  onClose: () => void;
}

export const DocumentViewerModal: FC<DocumentViewerModalProps> = ({ open, url, onClose }) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title="ตัวอย่างเอกสาร"
      width={900}
      styles={{ body: { padding: 0, minHeight: 600 } }}
      destroyOnClose
    >
      {url ? (
        <iframe
          title="document-preview"
          src={url}
          style={{ width: '100%', height: '600px', border: 'none' }}
        />
      ) : null}
    </Modal>
  );
};
