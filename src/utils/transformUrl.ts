  export const  transformFileUrl = (url: string) => {
    if (url.startsWith('http://localhost:3000')) {
      return url.replace('http://localhost:3000', 'http://localhost:5000');
    }
    if (url.startsWith('/')) {
      return `http://localhost:5000${url}`;
    }
    return url;
  };