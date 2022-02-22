import TWEEN from "@tweenjs/tween.js"
import type { PerspectiveCamera  } from 'three'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

interface Vector3 {
  x: number,
  y: number,
  z: number
}
type AnyFunction = () => any

const Animations = {
  //相机移动实现漫游等动画
  animateCamera: (
    camera: PerspectiveCamera,
    controls: OrbitControls,
    newPosition: Vector3,
    newTarget: Vector3,
    time = 2000,
    callBack: AnyFunction) => {
    var tween = new TWEEN.Tween({
      x1: camera.position.x, // 相机x
      y1: camera.position.y, // 相机y
      z1: camera.position.z, // 相机z
      x2: controls.target.x, // 控制点的中心点x
      y2: controls.target.y, // 控制点的中心点y
      z2: controls.target.z, // 控制点的中心点z
    });
    tween.to({
        x1: newPosition.x,
        y1: newPosition.y,
        z1: newPosition.z,
        x2: newTarget.x,
        y2: newTarget.y,
        z2: newTarget.z,
      },
      time
    );
    tween.onUpdate(function (object) {
      camera.position.x = object.x1;
      camera.position.y = object.y1;
      camera.position.z = object.z1;
      controls.target.x = object.x2;
      controls.target.y = object.y2;
      controls.target.z = object.z2;
      controls.update();
    });
    tween.onComplete(function () {
      controls.enabled = true;
      callBack && callBack();
    });
    tween.easing(TWEEN.Easing.Cubic.InOut);
    tween.start();
  },
}
export default Animations;