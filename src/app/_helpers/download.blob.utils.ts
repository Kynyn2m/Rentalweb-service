
export default  class DownloadBlob {
    static downloadBlobUrl(base64: string,name:string) 
    { 
        const reader = new FileReader();
        var byteString = atob(base64);
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
  
        for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: 'application/octet-stream' });
        reader.readAsDataURL(blob);
        var objectUrl = URL.createObjectURL(blob);
        var a = document.createElement("a");
        // a.setAttribute('target','_blank');
        document.body.appendChild(a);
        a.href = objectUrl;
        a.download = name;
        a.click();
        a.remove();
        window.URL.revokeObjectURL(objectUrl);
    }
}