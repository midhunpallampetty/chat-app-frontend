import  type Message from "../pages/types/Message";
export const inferMessageType = (msg: Message): Message => {
    if (!msg.type && msg.text.startsWith('/uploads/')) {
      const extension = msg.text.split('.').pop()?.toLowerCase();
      return {
        ...msg,
        type: 'file',
        fileType:
          ['jpg', 'jpeg', 'png', 'gif'].includes(extension || '') ? 'image/*' : extension === 'pdf' ? 'application/pdf' : undefined,
      };
    }
    return msg;
  };