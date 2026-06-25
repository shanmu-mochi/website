import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, MeshTransmissionMaterial } from '@react-three/drei'
import { Vector3 } from 'three'

export default function GlassLetter({ 
  letter, 
  index, 
  total = 11 // "Shanmu Raja" = 11 characters including space
}) {
  const meshRef = useRef()
  
  // Calculate initial position
  const initialX = (index - total / 2) * 1.2
  
  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    const time = state.clock.elapsedTime
    
    // Simple floating animation
    meshRef.current.position.y = Math.sin(time * 0.5 + index * 0.5) * 0.2
    meshRef.current.rotation.y = Math.sin(time * 0.3 + index * 0.3) * 0.1
    
    // Mouse interaction
    const mouse = state.mouse
    const distanceToMouse = new Vector3(mouse.x * 5, mouse.y * 5, 0)
      .distanceTo(meshRef.current.position)
    
    if (distanceToMouse < 3) {
      const influence = 1 - distanceToMouse / 3
      meshRef.current.material.ior = 1.5 + influence * 0.5
      meshRef.current.material.transmission = 1 - influence * 0.1
    }
  })
  
  return (
    <Text
      ref={meshRef}
      fontSize={1}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
      position={[initialX, 0, 0]}
    >
      {letter}
      <MeshTransmissionMaterial
        ior={1.5}
        thickness={1}
        roughness={0}
        transmission={1}
        dispersion={0.1}
        chromaticAberration={0.02}
        anisotropicBlur={1}
        temporalDistortion={0.2}
        distortionScale={0.5}
        color="#ffcc88"
        attenuationDistance={0.2}
        attenuationColor="#ffffff"
        samples={10}
        resolution={1024}
      />
    </Text>
  )
}
