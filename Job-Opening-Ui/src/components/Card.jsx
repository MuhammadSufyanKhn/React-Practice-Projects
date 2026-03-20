import React from 'react'
import { Bookmark } from 'lucide-react'

const Card = (props) => {
  return (
    
        <div className="child">

            <div className="top">
                <img src={props.logo} alt="Amazon Logo" />
                <button>save <Bookmark size={12} /></button>
            </div>

            <div className="center">
                <h3>{props.name} <span>{props.date}</span></h3>
                <h4>{props.post}</h4>
                <div className="tags">
                    <button>{props.tag1}</button>
                    <button>{props.tag2}</button>
                </div>
            </div>

            <div className="bottom">
                <div className="details">
                    <h2>{props.pay}</h2>
                    <p>{props.loc}</p>
                </div>
                <button className="apply-btn">Apply Now</button>
            </div>
            
        </div>
       
  )
}

export default Card