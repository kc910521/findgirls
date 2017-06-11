/**
 * Created by robu on 2017/6/2.
 */
function packImgItm(imgArr,hotArr){
    if (imgArr == undefined || hotArr == undefined){
        return null;
    }else{
        for (var imgItm of imgArr){
            for (let idx2 = 0;idx2 < hotArr.length; idx2 ++){
                if (hotArr[idx2].relImg.toString() == imgItm._id.toString()){
                    imgItm.hot = hotArr[idx2].fvCount;
                    break;
                }
                if (idx2 == hotArr.length-1 && imgItm.hot == undefined){
                    imgItm.hot = 1;
                }
            }
        }
        return imgArr;
    }
}




//将目标数组转为指定属性的数组
function pickToArray(_objs,attr){
    let tpArr = [];
    if (_objs == undefined){
        return null;
    }
    for (var itm of _objs){
        tpArr.push(itm[attr + '']);
    }
    return tpArr;
}
//得到orgArr不存在于arr2的所有元素
function arr1Analysis(orgArr,arr2){
    if (orgArr == undefined || arr2 == undefined || orgArr.length <= 0 || arr2.length <= 0){
        return null;
    }
    let resArr = [];
    for (var itm of orgArr){
        if (!contains(arr2,itm,"li_url")){
            resArr.push(itm);
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