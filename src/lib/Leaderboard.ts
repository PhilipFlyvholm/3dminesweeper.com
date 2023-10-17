
export type UpdatedScores = {
    local?: {
        clicks: boolean;
        threeBV: boolean;
        threeBVPerSec: boolean;
        efficiency: boolean;
        time: boolean;
    };
    global?: {
        clicks: boolean;
        threeBV: boolean;
        threeBVPerSec: boolean;
        efficiency: boolean;
        time: boolean;
    };
}

export function submitScore(size: {width: number, height: number, depth: number}, clicks: number, threeBV: number, threeBVPerSec: number, efficiency: number, time: number):UpdatedScores{
    return submitLocalScore(size, clicks, threeBV, threeBVPerSec, efficiency, time);
}

function submitLocalScore(size: {width: number, height: number, depth: number}, clicks: number, threeBV: number, threeBVPerSec: number, efficiency: number, time: number): UpdatedScores{
    const score = localStorage.getItem('score');
    const scoreObj = score ? JSON.parse(score) : {};
    const sizeString = `${size.width}x${size.height}x${size.depth}`;
    const sizeObj = scoreObj[sizeString];
    const updatedScore:UpdatedScores = {
        local: {
            clicks: false,
            threeBV: false,
            threeBVPerSec: false,
            efficiency: false,
            time: false
        },
        global: {
            clicks: false,
            threeBV: false,
            threeBVPerSec: false,
            efficiency: false,
            time: false
        }
    }
    if(sizeObj){
        if(!updatedScore.local) {
            updatedScore.local = {
                clicks: false,
                threeBV: false,
                threeBVPerSec: false,
                efficiency: false,
                time: false
            }
        }
        if(sizeObj.clicks > clicks){
            sizeObj.clicks = clicks;
            updatedScore.local.clicks = true;
        }
        if(sizeObj.threeBV < threeBV){
            sizeObj.threeBV = threeBV;
            updatedScore.local.threeBV = true;
        }
        if(sizeObj.threeBVPerSec < threeBVPerSec){
            sizeObj.threeBVPerSec = threeBVPerSec;
            updatedScore.local.threeBVPerSec = true;
        }
        if(sizeObj.efficiency < efficiency){
            sizeObj.efficiency = efficiency;
            updatedScore.local.efficiency = true;
        }
        if(sizeObj.time > time){
            sizeObj.time = time;
            updatedScore.local.time = true;
        }
    }else{
        scoreObj[sizeString] = {
            clicks: clicks,
            threeBV: threeBV,
            threeBVPerSec: threeBVPerSec,
            efficiency: efficiency,
            time: time
        }
        updatedScore.local = {
            clicks: true,
            threeBV: true,
            threeBVPerSec: true,
            efficiency: true,
            time: true
        }
    }
    localStorage.setItem('score', JSON.stringify(scoreObj));
    return updatedScore;
}