# Shanmu Raja Portfolio - Advanced Glass Physics with React Three Fiber

## 🔬 Advanced Glass Physics Implementation

This website features the most advanced glass physics engine implemented with React Three Fiber, incorporating real-world optical physics including:

### Physics Features Implemented

#### 1. **Snell's Law Refraction**
- Real-time calculation of light refraction through glass
- Total internal reflection detection
- Viewing angle-dependent refraction effects

#### 2. **Fresnel Equations**
- Perpendicular and parallel polarization calculations
- Unpolarized light averaging
- Realistic reflection intensity based on viewing angle

#### 3. **Cauchy Dispersion**
- Wavelength-specific refractive indices
- Chromatic aberration simulation
- Rainbow dispersion effects

#### 4. **Beer's Law Absorption**
- Light absorption through glass thickness
- Distance-based intensity falloff
- Realistic light transmission

#### 5. **Caustic Light Projections**
- Ray marching for light concentration
- Dynamic caustic patterns
- Multiple light source support

#### 6. **Thermal Effects**
- Temperature-based IOR changes
- Thermal expansion simulation
- Real-time optical property updates

### Technical Implementation

#### React Three Fiber Integration
- Custom GLSL shaders for glass rendering
- GPU-accelerated refraction calculations
- Real-time chromatic dispersion
- Advanced lighting models

#### Advanced Shader System
- Custom vertex shaders with noise distortion
- Fragment shaders with Snell's law implementation
- Real-time caustic calculations
- Chromatic aberration effects

#### Scroll-Based Animations
- Letters stretch vertically (0-40% scroll)
- Move upward and converge (40-70% scroll)
- Form navigation bar (70-100% scroll)
- Smooth physics-based transitions

### Glass Elements

#### 1. **Header Letters ("Shanmu Raja")**
- Individual 3D glass letters with physics
- Mouse-interactive refraction
- Scroll-based morphing animation
- Chromatic aberration effects
- Custom GLSL shaders

#### 2. **Essay Boxes**
- Wavelength-specific coloring (650nm, 550nm, 450nm)
- Advanced caustic projections
- Refraction displacement layers
- 3D perspective transformations
- MeshTransmissionMaterial

### Performance Optimizations

- **GPU Acceleration**: Custom GLSL shaders
- **Instanced Rendering**: Efficient letter rendering
- **LOD System**: Quality scaling based on distance
- **Frustum Culling**: Only render visible elements
- **Mobile Optimization**: Reduced effects for mobile devices

### Browser Support

- **Modern Browsers**: Full WebGL2 support
- **Mobile**: Optimized performance with reduced effects
- **Fallback**: Basic glass effects for older browsers
- **Accessibility**: Reduced motion support

## 🚀 Getting Started

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd websitev2

# Install dependencies
npm install

# Start development server
npm run dev
```

### Configuration
The glass physics engine accepts these configuration options:

```javascript
{
    ior: 1.52,                    // Index of refraction
    dispersion: 0.05,             // Chromatic dispersion
    thickness: 2,                 // Glass thickness
    roughness: 0,                 // Surface roughness
    transmission: 1,              // Light transmission
    chromaticAberration: 0.02,    // Chromatic aberration
    bloomIntensity: 0.5,          // Bloom effect intensity
    caustics: true                // Enable caustic lighting
}
```

### Debug Controls
Add `#debug` to the URL to access Leva debug controls for real-time tweaking of glass properties.

## 🔧 Technical Details

### Shader Implementation
- **Vertex Shader**: Noise distortion, mouse interaction, Fresnel calculations
- **Fragment Shader**: Snell's law, dispersion, caustics, absorption
- **Performance**: 60fps target with quality scaling

### Physics Constants
```javascript
IOR: {
    AIR: 1.0003,
    WATER: 1.333,
    GLASS: 1.52,
    DIAMOND: 2.42,
    CRYSTAL: 1.9
}

CAUCHY: {
    A: 1.5168,
    B: 0.00459,
    C: 0.00021
}
```

### Scroll Physics
- **Phase 1 (0-40%)**: Vertical stretch with increasing dispersion
- **Phase 2 (40-70%)**: Convergence to center with rotation
- **Phase 3 (70-100%)**: Morphing into navigation bar

## 📱 Responsive Design

- **Desktop**: Full physics engine with all effects
- **Tablet**: Optimized performance with reduced complexity
- **Mobile**: Essential effects only for smooth performance
- **Accessibility**: Reduced motion support for accessibility

## 🎨 Visual Effects

### Glass Letters
- Real-time refraction based on mouse position
- Chromatic aberration with wavelength separation
- Dynamic caustic light projections
- Scroll-based morphing animations
- Custom GLSL shader effects

### Essay Boxes
- Wavelength-specific coloring (red, green, blue)
- Advanced caustic projections beneath boxes
- Refraction displacement layers
- 3D hover effects with perspective
- MeshTransmissionMaterial with dispersion

## 🔬 Scientific Accuracy

This implementation uses real optical physics equations:

1. **Snell's Law**: `n₁sin(θ₁) = n₂sin(θ₂)`
2. **Fresnel Equations**: `R = ((n₁cos(θ₁) - n₂cos(θ₂)) / (n₁cos(θ₁) + n₂cos(θ₂)))²`
3. **Cauchy Dispersion**: `n(λ) = A + B/λ² + C/λ⁴`
4. **Beer's Law**: `I = I₀e^(-αd)`

## 🚀 Performance Metrics

- **Target FPS**: 60fps
- **Physics Calculations**: Real-time at 60Hz
- **GPU Utilization**: Custom GLSL shaders
- **Memory Usage**: Optimized with object pooling
- **Mobile Performance**: 30fps minimum on mobile devices

## 📄 License

MIT License - Feel free to use this advanced glass physics engine in your own projects!

---

**Built with ❤️ using React Three Fiber, real optical physics, and advanced GLSL shaders for the ultimate glass simulation experience.**