import axios from "axios";
import fs from 'fs';
import download from 'download'

interface iAlbumItem {
    title: string;
    src: string;
}

interface iTracks {
    albumCoverPath: string; // "storages/5fdc-audiofreehighqps/1B/9C/GMCoOR8Hdw9HAAzW9wHisi_R.jpeg";
    albumId: number; // 35645970
    albumTitle: string; // "投资悟道 渡人渡己 （金冰）";
    anchorId: number; // 167660176
    anchorName: string; // "长岛金冰";
    title: string; // "我为什么开这个栏目？"
    trackId: string; // 271821360
    index: number;
}
interface iGetTracksList {
    albumId: number;
    currentUid: number;
    lastPlayTrackId: number;
    pageNum: number;
    pageSize: number;
    sort: 0 | 1;
    trackTotalCount: number; // 总的音频数量
    tracks: iTracks[]
}
interface iAlbumConfig {
    id: string;
    albumTitle: string;
    pageNum: number;
    pageSize: number;
    maxSize: number;
    maxPage: number;
    AlbumList: iAlbumItem[]
}
interface TAudio {
    data: {
        src: string; // https://aod.cos.tx.xmcdn.com/group78/M08/D1/81/wKgO4F526g_Sv9RuAFUELgybFPs755.m4a
    }
}
const AlbumConfig: iAlbumConfig = {
    id: "35645970",
    pageNum: 1,
    albumTitle: '',
    pageSize: 30,
    maxSize: -1,
    maxPage: -1,
    AlbumList: []
}
const SavedFile = 'data.json';

const getTracksListUrl = (p: number) => {
    // https://www.ximalaya.com/revision/album/v1/getTracksList?albumId=35645970&pageNum=1&pageSize=30
    return `https://www.ximalaya.com/revision/album/v1/getTracksList?albumId=${AlbumConfig.id}&pageNum=${p}&pageSize=${AlbumConfig.pageSize}`
}

const getAlbumSrc = (trackId: string): Promise<string> => new Promise(async (resolve, reject) => {
    // 根据id请求音频
    // https://www.ximalaya.com/revision/play/v1/audio?id=271829290&ptype=1
    let response = await axios.get<TAudio>(`https://www.ximalaya.com/revision/play/v1/audio?id=${trackId}&ptype=1`);
    resolve(response.data.data.src)
})

/* 
1. 获取第一页，确定页数和个数，将第一页的url放入到AlbumList
2. 获取第二页到最后一页
3. 将获取到的链接写入文件
*/
async function getAblums() {
    const initUrl = getTracksListUrl(1);
    let initData = await axios.get(initUrl)
    let fmtInitData: iGetTracksList = initData.data.data
    AlbumConfig.albumTitle = fmtInitData.tracks[0].albumTitle;
    AlbumConfig.maxSize = fmtInitData.trackTotalCount;
    AlbumConfig.maxPage = Math.ceil(AlbumConfig.maxSize / AlbumConfig.pageSize);
    for (let item of fmtInitData.tracks) {
        const albumSrc = await getAlbumSrc(item.trackId);
        AlbumConfig.AlbumList.push({
            title: `${item.index}.${item.title}`,
            src: albumSrc
        });
        console.log('√ ', item.index, albumSrc);
    }

    for (let index = 2; index <= AlbumConfig.maxPage; index++) {
        const url = getTracksListUrl(index);
        let data = await axios.get(url)
        let fmtData: iGetTracksList = data.data.data;
        for (let item of fmtData.tracks) {
            const albumSrc = await getAlbumSrc(item.trackId);
            AlbumConfig.AlbumList.push({
                title: `${item.index}.${item.title}`,
                src: albumSrc
            });
            console.log('√ ', item.index, albumSrc);
        }
    }
    fs.writeFile(SavedFile, JSON.stringify(AlbumConfig), () => { })
}




async function downloadFile() {
    fs.readFile(SavedFile, async (err, data) => {
        if (err) {
            console.log('read file error');
        } else {
            let jsonData = JSON.parse(data.toString());
            for (let item of jsonData.AlbumList) {
                let fileName = `./m4a/${item.title.replace(/ /g, '')}.m4a`;
                try {
                    let binaryData = await download(item.src);
                    fs.writeFileSync(fileName, binaryData);
                    console.log(`download ${fileName}`);
                } catch (e) {
                    console.log(e);
                }
            }
        }
    })

}



// getAblums();
downloadFile();




