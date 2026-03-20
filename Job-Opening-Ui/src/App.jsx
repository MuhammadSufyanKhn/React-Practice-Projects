import React from 'react'
import Card from './components/Card'
import { Car } from 'lucide-react';

const App = () => {

  const jobs = [
    {
      brandLogo: "https://pngimg.com/uploads/meta/meta_PNG12.png",
      companyName: "Meta",
      datePosted: "1 day ago",
      post: "React UI Developer",
      tag1: "Full Time",
      tag2: "Entry Level",
      pay: "$65/hour",
      location: "Remote"
    },
    {
      brandLogo: "https://static.vecteezy.com/system/resources/previews/014/018/561/non_2x/amazon-logo-on-transparent-background-free-vector.jpg",
      companyName: "Amazon",
      datePosted: "3 days ago",
      post: ".NET Backend Engineer",
      tag1: "Full Time",
      tag2: "Junior Level",
      pay: "$70/hour",
      location: "Seattle, USA"
    },
    {
      brandLogo: "https://substackcdn.com/image/fetch/$s_!G1lk!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8ed3d547-94ff-48e1-9f20-8c14a7030a02_2000x2000.jpeg",
      companyName: "Apple",
      datePosted: "1 week ago",
      post: "Compiler Engineer",
      tag1: "Contract",
      tag2: "Mid Level",
      pay: "$85/hour",
      location: "Cupertino, USA"
    },
    {
      brandLogo: "https://images.ctfassets.net/4cd45et68cgf/Rx83JoRDMkYNlMC9MKzcB/2b14d5a59fc3937afd3f03191e19502d/Netflix-Symbol.png?w=700&h=456",
      companyName: "Netflix",
      datePosted: "Just now",
      post: "Full Stack Developer (C# & JS)",
      tag1: "Full Time",
      tag2: "Mid Level",
      pay: "$95/hour",
      location: "Remote"
    },
    {
      brandLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png",
      companyName: "Google",
      datePosted: "2 days ago",
      post: "AI Research Intern",
      tag1: "Part Time",
      tag2: "Internship",
      pay: "$40/hour",
      location: "Karachi, Pakistan (Hybrid)"
    },
    {
      brandLogo: "https://download.logo.wine/logo/Microsoft_Store/Microsoft_Store-Logo.wine.png",
      companyName: "Microsoft",
      datePosted: "4 days ago",
      post: "Cloud Network Engineer",
      tag1: "Full Time",
      tag2: "Junior Level",
      pay: "$75/hour",
      location: "Redmond, USA"
    },
    {
      brandLogo: "https://blog.logomaster.ai/hs-fs/hubfs/ibm-logo-1967.jpg?width=672&height=454&name=ibm-logo-1967.jpg",
      companyName: "IBM",
      datePosted: "1 week ago",
      post: "ERP Systems Analyst",
      tag1: "Full Time",
      tag2: "Mid Level",
      pay: "$80/hour",
      location: "Remote"
    },
    {
      brandLogo: "https://www.pngplay.com/wp-content/uploads/13/Tesla-Logo-PNG-HD-Quality.png",
      companyName: "Tesla",
      datePosted: "5 hours ago",
      post: "Software Engineer (.NET Core)",
      tag1: "Full Time",
      tag2: "Junior Level",
      pay: "$70/hour",
      location: "Austin, USA"
    },
    {
      brandLogo: "https://www.nvidia.com/content/dam/en-zz/Solutions/about-nvidia/logo-and-brand/nvidia-og-image-white-bg-1200x630.jpg",
      companyName: "NVIDIA",
      datePosted: "2 weeks ago",
      post: "Machine Learning Engineer",
      tag1: "Full Time",
      tag2: "Mid Level",
      pay: "$100/hour",
      location: "Santa Clara, USA"
    },
    {
      brandLogo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnOVjTWaheo4E99cgYZ6y14tpsgHlm0VN8Hw&s",
      companyName: "Oracle",
      datePosted: "3 days ago",
      post: "Database Networking Specialist",
      tag1: "Full Time",
      tag2: "Junior Level",
      pay: "$60/hour",
      location: "Karachi, Pakistan"
    }
];

  return (
    <div className='parent'> 
      {jobs.map(function(elem) {
        return (
          <Card 
            logo={elem.brandLogo} 
            name={elem.companyName} 
            date={elem.datePosted} 
            post={elem.post}
            tag1={elem.tag1} 
            tag2={elem.tag2} 
            pay={elem.pay} 
            loc={elem.location} 
          />
        )
      })} 
     
    </div> 
  )

}

export default App