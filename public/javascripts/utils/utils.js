/**
 * Created by robu on 2017/6/2.
 */
function packImgItm(imgArr,hotArr){
    if (imgArr == undefined || hotArr == undefined){
        return null;
    }else{
        for (var idx1 = 0;idx1 < imgArr.length;idx1 ++){
            for (var idx2 = 0;idx2 < hotArr.length; idx2 ++){
                if (hotArr[idx2].relImg.toString() == imgArr[idx1]._id.toString()){
                    imgArr[idx1].hot = hotArr[idx2].fvCount;
                    break;
                }
                if (idx2 == hotArr.length-1 && imgArr[idx1].hot == undefined){
                    imgArr[idx1].hot = 1;
                }
            }
        }
        return imgArr;
    }
}



//将目标数组转为指定属性的数组
function pickToArray(obj,attr){
    var tpArr = [];
    if (obj == undefined){
        return null;
    }
    for (var idx = 0; idx < obj.length; idx ++){
        tpArr.push(obj[idx][attr+""]);
    }
    return tpArr;
}
//得到orgArr不存在于arr2的所有元素
function arr1Analysis(orgArr,arr2){
    if (orgArr == undefined || arr2 == undefined || orgArr.length <= 0 || arr2.length <= 0){
        return null;
    }
    var resArr = [];
    for (var idx = 0; idx < orgArr.length ;idx ++){
        if (!contains(arr2,orgArr[idx],"li_url")){
            resArr.push(orgArr[idx]);
        }
    }
    return resArr;
}
function contains(a, obj,objParam) {
    var i = a.length;
    while (i--) {
        if (objParam){
            if (a[i][objParam] === obj) {
                return true;
            }
        }else{
            if (a[i] === obj) {
                return true;
            }
        }
    }
    return false;
}

/**
 * 得到随机页码
 * @param totalQty
 * @returns {*}
 */
function takePageArrs(totalQty,pageNum){
    if (pageNum == undefined){
        pageNum = 20;//show @pageNum itms per page
    }
    let lastPn = Math.ceil(totalQty/pageNum);
    let maxShow = lastPn>99?99:lastPn;
    //var pgArrs = [];
    let vTmpIdx = null;
    let vTemplate = [];
    if (maxShow.length == 0){
        return [1];
    }
    for (let idx = 1;idx <= maxShow;idx ++){
        vTemplate.push(idx);
    }
    for (let idx = 0;idx < (maxShow/3)+1;idx ++){
        vTmpIdx = Math.floor(Math.random()*maxShow);
        var tmpVal = vTemplate[idx];
        vTemplate[idx] = vTemplate[vTmpIdx];
        vTemplate[vTmpIdx] = tmpVal;
    }
    /*
     暂时废弃====开始实行替换法造随机
     for (var idx = 0;idx < maxShow/3;idx ++){
     vTmp = (Math.random()*maxShow)+1;
     if (contains(pgArrs,vTmp)){
     idx --;
     }else{
     pgArrs.push(vTmp);
     vTemplate.splice(vTmp-1,1);
     }
     }*/
    return vTemplate;
}
export {
    packImgItm as packImgItm,
    takePageArrs as takePageArrs,
    contains as contains,
    arr1Analysis as arr1Analysis,
    pickToArray as pickToArray
}