import { useEffect } from "react"


type SplashScreenProps = {
  onFinish: () => void
}

export default function SplashScreen({onFinish} : SplashScreenProps) {
  useEffect(() => {
    const  timer  = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, [onFinish])

  return (
      <div className="container flex h-screen justify-center bg-gray-50">
        <img src="/icon-512*512.png" alt="logo" className="w-40 h-40"/>
      </div>
  )
}
