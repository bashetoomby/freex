import { CSSProperties } from "react";
import "./Skeleton.css"

const Skeleton = ({ height, styles }: { height: string, styles: CSSProperties }) => {
    return (
        <div className="skeleton" style={{ height: height, ...styles }}>
            <span className="skeleton__span"></span>
        </div>
    );
}

export default Skeleton;