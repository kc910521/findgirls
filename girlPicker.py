# encoding=utf-8
__author__ = 'KCSTATION'

import requests;
import re;
import urllib;
import urllib2;
import os;
import sys;
import json;
import cStringIO;
from PIL import Image;

from random import Random

reload(sys);
type = sys.getfilesystemencoding();
headerParam = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36',
      'accept':'/',
      'accept-encoding':'gzip, deflate, sdch',
      'accept-language':'zh-CN,zh;q=0.8,en;q=0.6',
      'upgrade-insecure-requests':'1',
      'referer':'http://yy.18183.com/',
      'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36'
      }
#什么鬼
def takeHtmlRes(webUrl):
    htmlSr = requests.get(webUrl,headers = headerParam);
    return htmlSr.text;

def takeVabTxt(webSource):
    print "=================ok================";
    resArrs = [];
    itemInfo = {};
    #take all valuable html step 1
    vabPart = re.findall('<textarea .*?>(.*?)</textarea>',webSource,re.S);
    #refined part html step2
    vptxt = vabPart.__str__();
    print(vptxt.strip().decode())
    jObj = eval(vptxt.strip());
    #print jObj;
    for dm in jObj:
        # if isinstance(dm,unicode):
        #     dm = dm.encode('utf-8','ignore');
        print dm;

    # pack to dir
    return resArrs;

def yeskyListTaker(webSource):
    print "=================ok================";
    resArrs = [];
    itemInfo = {};
    #获取<a href></a>中的URL
    print u'\n获取链接中URL:'
    res_url = r"(?<=href=\").+?(?=\")";
    #|(?<=href=\').+?(?=\')class=\'s xst\'
    links = re.findall(res_url ,  webSource, re.I|re.S|re.M)
    for url in links:
        s = re.match('^thread.*?html',url)
        if str(s)!='None':
            if  not resArrs.__contains__(url):
                resArrs.append(url);
                print url;#得到了帖子url
    return resArrs;
#图片获取
def yeskyImageTaker(webSource):
    print "=================ok================";
    resArrs = [];
    itemInfo = {};
    #获取<a href></a>中的URL
    print u'\n获取链接中URL:'
    res_url = r"(?<=class=\"t_f\").+?(?=tr>)";
    res_url2 = r"(?<=file=\").+?(?=\")";
    #|(?<=href=\').+?(?=\')class=\'s xst\'
    post1 = re.findall(res_url ,  webSource, re.I|re.S|re.M)
    for hml in post1:
        #拿图片url
            imgSrc = re.findall(res_url2 ,  hml, re.I|re.S|re.M);
            for tsrc in imgSrc:
                if  not resArrs.__contains__(tsrc):
                    resArrs.append(tsrc);
                    print("111:"+tsrc);
    return resArrs;


#minSize is byte
#return array of imageUrl
def saveFileToLocal(imgSrcs,savePath,minSize,storage='local'):
    fileSrcs = [];
    print "download begin..."
    for im in imgSrcs:
        filename = "img"+random_str()+"."+im.split(".")[-1]
        dist = os.path.join(savePath, filename)
        #这种方式先拉头部，应该好多了，不用再下载一次
        connection = urllib2.build_opener().open(urllib2.Request(im))
        if int(connection.headers.dict['content-length']) < minSize:
            print(filename+" 4 image is fucking small.")
            continue;
        if storage == 'local':
            urllib.urlretrieve(im, dist,None);
            fileSrcs.append({"url":filename,"w":1,"h":1});
        else:
            urllib.urlretrieve(im, dist,None);
            print "7niu begin:"
            imgW,imgH = qiniu(savePath,filename);
            fileSrcs.append({"url":"http://oc3bxwhj2.bkt.clouddn.com/"+filename,"w":imgW,"h":imgH});
            print "7niu over"




        print "Done: ", filename,",size:",connection.headers.dict['content-length'];
    print "download end..."
    return fileSrcs;

def random_str(randomlength=24):
    str = ''
    chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789'
    length = len(chars) - 1
    random = Random()
    for i in range(randomlength):
        str+=chars[random.randint(0, length)]
    return str

from qiniu import Auth, put_file, etag, urlsafe_base64_encode,config
# import qiniu.config
config.set_default(default_zone=config.zone1);
q = Auth("ZPlitVRYXrfR0J21PZJb3k1g_xzRCdcoX1IehiI9", "36-XLM_u3byRumcsdcYvGzgU6gDTkF3DcKKnYNFJ");
bucket_name = 'girl-imgs';#要上传的空间
#返回图片宽高的元祖
def qiniu(fileMotherPath,fileName):

    #上传到七牛后保存的文件名
    key = fileName;#'my-python-logo.png';

    #生成上传 Token，可以指定过期时间等
    token = q.upload_token(bucket_name, key, 3600)

    #要上传文件的本地路径
    localfile = fileMotherPath+"/"+fileName;# './sync/bbb.jpg'

    ret, info = put_file(token, key, localfile)
    img = Image.open(localfile);
    print "======================================"
    print img.size[0]," & ", img.size[1];
    assert ret['key'] == key
    assert ret['hash'] == etag(localfile);
    return img.size;

def postToServer(serverUrl,param):
    postHd = {"Content-Type":"application/x-www-form-urlencoded",
           "Connection":"Keep-Alive","Referer":"http://www.python.com"};
    requests.post(url=serverUrl,data=param);


if __name__ == '__main__':
    #1
   # resHtml1 =  takeHtmlRes("http://yy.18183.com/meinv/tj/list_1928_6.html");
    #print resHtml;
   # hmArrs = takeVabTxt(resHtml1);


    #2---------------------------
    timesCaller = 0;
    resHtml2 =  takeHtmlRes("http://pic.yesky.com/bbs/forum-20498-1.html");
    liUrls = yeskyListTaker(resHtml2);#http://pic.yesky.com/bbs/
    #refine urlobj {"li_url":"thread-308673-1-1.html","_id":"57bb0c860e2afe37e51c94e3"}
    refUrls = takeHtmlRes("http://ck.lchbl.com:3000/history/ref?urls="+json.dumps(liUrls[:10]));
    refUrlObj = json.loads(refUrls,encoding="utf-8");
    for liurl  in refUrlObj:
        imgFromUrl = "http://pic.yesky.com/bbs/"+liurl["li_url"];
        print "in "+imgFromUrl;
        resHtml2_1 =  takeHtmlRes(imgFromUrl);
        imgSrcs = yeskyImageTaker(resHtml2_1);
        newImgs = saveFileToLocal(imgSrcs,"D:\portrait",10000,"7niu");
        print(newImgs);
        jsonArr = [];
        for imgtmp in newImgs:
            jsonArr.append({"name":"美女","img":imgtmp["url"],"from":imgFromUrl,"w":imgtmp["w"],"h":imgtmp["h"]});
        lastJson = json.dumps(jsonArr);
            #postToServer("http://ck.lchbl.com:3000/item/batch/save",{"obj_items":lastJson});
    #postToServer("http://ck.lchbl.com:3000/item/batch/save",{"obj_items":"[{\"name\":\"mm\",\"img\":\"sasasasasasassa\",\"from\":\"111\"}]"});
    #======================working team---for 抓取数据并写入骑牛，中枢mongodb
    # imgFromUrl = "http://pic.yesky.com/bbs/thread-305800-1-1.html";
    # resHtml2_1 =  takeHtmlRes(imgFromUrl);
    # imgSrcs = yeskyImageTaker(resHtml2_1);
    # newImgs = saveFileToLocal(imgSrcs,"D:\portrait",10000,"7niu");
    # print(newImgs);
    # jsonArr = [];
    # for imgtmp in newImgs:
    #     jsonArr.append({"name":"美女","img":imgtmp,"from":imgFromUrl});
    # lastJson = json.dumps(jsonArr);
    # takeHtmlRes("http://ck.lchbl.com:3000/item/batch/save?obj_items="+lastJson);
    #======================working team
    #qiniu("D:\portrait","imgm4lU3X1G4NtL7T8I7MoBQSMX.jpg");
    #http://oc3bxwhj2.bkt.clouddn.com/
    #print newImgs;s
    #print resHtml2;

    #saveUrlToServer();#/
    #'name'] == undefined || itmInfs[idx]['img'
