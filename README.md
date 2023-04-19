
下载喜马拉雅专辑音频

2023/04/19

```bash
npm i 
sh run.sh
```


```typescript
const AlbumConfig: iAlbumConfig = {
    id: "35645970", /* 专辑id */
    pageNum: 1, /* 第一页 */
    albumTitle: '', /* 专辑名称 */
    pageSize: 30, /* 每页请求多少个 */
    maxSize: -1,  /* 一共多少个音频 */
    maxPage: -1,  /* 一共多少页 */
    AlbumList: [] /* 存放音频的链接 */
}

// getAblums(); /* 获取专辑的所有音频链接，并保存到data.json中 */
// downloadFile(); /* 下载data.json中所有的音频链接，保存到m4a文件夹中 */
```