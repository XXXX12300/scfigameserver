const fs = require('fs');
const path = require('path');

class MapSystem {
    constructor() {
        this.maps = {
            'industrial_factory': {
                width: 2800,
                height: 2800,
                baseTexture: 'Concrete_01_Grey_1.png',
                controlZones: [
                    { id: 'zone_a', x: 1400, y: 1400, radius: 250, owner: null, progress: 0 }
                ],
                terrainRegions: [
                    { x: 1000, y: 0, w: 800, h: 2800, texture: 'Metal_01_Grey_1.png', type: 'walkable' },
                    { x: 0, y: 1000, w: 2800, h: 800, texture: 'Metal_01_Grey_1.png', type: 'walkable' }
                ],
                spawnPoints: {
                    blue: [{ x: 300, y: 800 }],
                    red: [{ x: 2500, y: 2000 }]
                },
                buildings: [
                    {
                        id: 'factory_main_hall', bounds: { x: 800, y: 400, w: 1200, h: 2000 },
                        roofTexture: 'Roof_Tiles_01_Grey_1.png', floorTexture: 'Metal_01_Grey_Square_1.png',
                        wallTexture: 'Metal_01_Grey_1.png',
                        entrances: [
                            { x: 1300, y: 400, w: 200, h: 50 },
                            { x: 1300, y: 2350, w: 200, h: 50 },
                            { x: 800, y: 1300, w: 50, h: 200 },
                            { x: 1950, y: 1300, w: 50, h: 200 }
                        ],
                        walls: [
                            { x: 800, y: 400, w: 500, h: 50 },
                            { x: 1500, y: 400, w: 500, h: 50 },
                            { x: 800, y: 2350, w: 500, h: 50 },
                            { x: 1500, y: 2350, w: 500, h: 50 },
                            { x: 800, y: 400, w: 50, h: 900 },
                            { x: 800, y: 1500, w: 50, h: 900 },
                            { x: 1950, y: 400, w: 50, h: 900 },
                            { x: 1950, y: 1500, w: 50, h: 900 }
                        ]
                    }
                ],
                obstacles: [
                    { x: 300, y: 300, w: 300, h: 300, texture: 'Metal_04_Yellow_01.png', type: 'building' },
                    { x: 2200, y: 2200, w: 300, h: 300, texture: 'Metal_04_Yellow_01.png', type: 'building' },
                    // Forklifts/Trucks parked near factory entrances
                    { x: 1200, y: 200, w: 500, h: 250, texture: 'Vehicles/truck.png', type: 'building' },
                    { x: 1400, y: 2600, w: 500, h: 250, texture: 'Vehicles/truck.png', type: 'building' },
                    // New industrial props using textures
                    { x: 500, y: 500, w: 100, h: 100, texture: 'all textures/iron_block (10).png', type: 'building' }, // Iron block cluster
                    { x: 600, y: 500, w: 100, h: 100, texture: 'all textures/iron_block (11).png', type: 'building' },
                    { x: 550, y: 600, w: 100, h: 100, texture: 'all textures/iron_block (12).png', type: 'building' },
                    { x: 2200, y: 300, w: 100, h: 100, texture: 'all textures/IconBarrelCompost.png', type: 'building' }, // Barrels
                    { x: 2300, y: 300, w: 100, h: 100, texture: 'all textures/IconBarrelCompost.png', type: 'building' },
                    { x: 2250, y: 400, w: 100, h: 100, texture: 'all textures/IconBarrelCompost.png', type: 'building' },
                    { x: 2400, y: 1200, w: 120, h: 120, texture: 'all textures/coal_block (10).png', type: 'building' }, // Coal pile
                    { x: 2450, y: 1300, w: 120, h: 120, texture: 'all textures/coal_block (11).png', type: 'building' },
                    { x: 900, y: 500, w: 100, h: 100, texture: 'all textures/wood.png', type: 'building' }, // Wooden crates
                    { x: 1000, y: 500, w: 100, h: 100, texture: 'all textures/wood.png', type: 'building' },
                    
                    // Factory Office Furniture
                    { x: 900, y: 2100, w: 100, h: 50, texture: 'Furniture/Tables/Table_Oval_Grey.png', type: 'building' },
                    { x: 900, y: 2040, w: 60, h: 60, texture: 'Furniture/Chairs/Armchair_Grey.png', type: 'building' },
                    { x: 1800, y: 2100, w: 100, h: 100, texture: 'Furniture/Tables/Cabinet_Veneer.png', type: 'building' },
                    { x: 1800, y: 2250, w: 80, h: 80, texture: 'Decor/Plants/Plant_3.png', type: 'building' }
                ]
            },
            'medieval_castle': {
                width: 3000,
                height: 3000,
                baseTexture: 'all textures/water_still (12).png',
                controlZones: [
                    { id: 'keep', x: 1500, y: 1500, radius: 300, owner: null, progress: 0 }
                ],
                terrainRegions: [
                    { x: 300, y: 300, w: 2400, h: 2400, texture: 'Grass_01_Green_1.png', type: 'walkable' },
                    { x: 1300, y: 0, w: 400, h: 300, texture: 'Wood_Planks_01_Brown_1.png', type: 'walkable' }, // North Bridge
                    { x: 1300, y: 2700, w: 400, h: 300, texture: 'Wood_Planks_01_Brown_1.png', type: 'walkable' } // South Bridge
                ],
                spawnPoints: {
                    blue: [{ x: 1500, y: 200 }], // North spawn on bridge
                    red: [{ x: 1500, y: 2800 }]  // South spawn on bridge
                },
                buildings: [
                    // Outer Castle Walls
                    {
                        id: 'castle_wall_north', bounds: { x: 500, y: 500, w: 2000, h: 200 },
                        roofTexture: 'Cobblestones_01_Grey_1.png', floorTexture: 'Cobblestones_01_Grey_1.png',
                        wallTexture: 'Cobblestones_01_Grey_1.png',
                        entrances: [{ x: 1300, y: 500, w: 400, h: 200 }], walls: []
                    },
                    {
                        id: 'castle_wall_south', bounds: { x: 500, y: 2300, w: 2000, h: 200 },
                        roofTexture: 'Cobblestones_01_Grey_1.png', floorTexture: 'Cobblestones_01_Grey_1.png',
                        wallTexture: 'Cobblestones_01_Grey_1.png',
                        entrances: [{ x: 1300, y: 2300, w: 400, h: 200 }], walls: []
                    },
                    {
                        id: 'castle_wall_west', bounds: { x: 500, y: 700, w: 200, h: 1600 },
                        roofTexture: 'Cobblestones_01_Grey_1.png', floorTexture: 'Cobblestones_01_Grey_1.png',
                        wallTexture: 'Cobblestones_01_Grey_1.png',
                        entrances: [{ x: 500, y: 1300, w: 200, h: 400 }], walls: []
                    },
                    {
                        id: 'castle_wall_east', bounds: { x: 2300, y: 700, w: 200, h: 1600 },
                        roofTexture: 'Cobblestones_01_Grey_1.png', floorTexture: 'Cobblestones_01_Grey_1.png',
                        wallTexture: 'Cobblestones_01_Grey_1.png',
                        entrances: [{ x: 2300, y: 1300, w: 200, h: 400 }], walls: []
                    },
                    // The Inner Keep
                    {
                        id: 'castle_keep', bounds: { x: 1100, y: 1100, w: 800, h: 800 },
                        roofTexture: 'Brick Plaster/Brick_Plaster_03_Grey_1.png', floorTexture: 'Wood_Planks_01_Brown_1.png',
                        wallTexture: 'Brick Plaster/Brick_Plaster_04_Grey_1.png',
                        entrances: [
                            { x: 1400, y: 1100, w: 200, h: 50 }, // North door
                            { x: 1400, y: 1850, w: 200, h: 50 }  // South door
                        ],
                        walls: [
                            { x: 1100, y: 1100, w: 300, h: 50 }, // N Left
                            { x: 1600, y: 1100, w: 300, h: 50 }, // N Right
                            { x: 1100, y: 1850, w: 300, h: 50 }, // S Left
                            { x: 1600, y: 1850, w: 300, h: 50 }, // S Right
                            { x: 1100, y: 1150, w: 50, h: 700 }, // W Wall
                            { x: 1850, y: 1150, w: 50, h: 700 }, // E Wall
                            // Inner pillars/cover
                            { x: 1300, y: 1300, w: 100, h: 100 },
                            { x: 1600, y: 1300, w: 100, h: 100 },
                            { x: 1300, y: 1600, w: 100, h: 100 },
                            { x: 1600, y: 1600, w: 100, h: 100 }
                        ]
                    }
                ],
                obstacles: [
                    // Decorative nature for the castle
                    { x: 1000, y: 1000, w: 128, h: 128, texture: 'BIGLEAVES.png', type: 'building' },
                    { x: 2000, y: 2000, w: 128, h: 128, texture: 'BIGLEAVES.png', type: 'building' },
                    { x: 800, y: 2000, w: 64, h: 64, texture: 'all textures/bedrock (15).png', type: 'building' },
                    { x: 2200, y: 800, w: 64, h: 64, texture: 'all textures/bedrock (16).png', type: 'building' }
                ],
                obstacles: []
            },
            'small_town': {
                width: 3000,
                height: 3000,
                baseTexture: 'Grass_01_Green_1.png',
                controlZones: [
                    { id: 'crossroads', x: 1500, y: 1500, radius: 250, owner: null, progress: 0 }
                ],
                terrainRegions: [
                    // Main cross roads
                    { x: 1300, y: 0, w: 400, h: 3000, texture: 'Dirt_Cracked_01_Brown_1.png', type: 'walkable' },
                    { x: 0, y: 1300, w: 3000, h: 400, texture: 'Dirt_Cracked_01_Brown_1.png', type: 'walkable' }
                ],
                spawnPoints: {
                    blue: [{ x: 400, y: 1500 }], // West Road
                    red: [{ x: 2600, y: 1500 }]  // East Road
                },
                buildings: [
                    // NW House
                    {
                        id: 'house_nw', bounds: { x: 500, y: 500, w: 600, h: 600 },
                        roofTexture: 'Brick Plaster/Brick_Plaster_03_Red_1.png', floorTexture: 'Wood_Planks_01_Brown_1.png',
                        wallTexture: 'Brick Plaster/Brick_Plaster_04_Red_1.png',
                        entrances: [{ x: 800, y: 1050, w: 150, h: 50 }, { x: 1050, y: 700, w: 50, h: 150 }], // South & East doors to roads
                        walls: [
                            { x: 500, y: 500, w: 600, h: 50 }, // North wall
                            { x: 500, y: 550, w: 50, h: 550 }, // West wall
                            { x: 500, y: 1050, w: 300, h: 50 }, // South wall left
                            { x: 950, y: 1050, w: 150, h: 50 }, // South wall right
                            { x: 1050, y: 500, w: 50, h: 200 }, // East wall top
                            { x: 1050, y: 850, w: 50, h: 250 }  // East wall bottom
                        ]
                    },
                    // NE House
                    {
                        id: 'house_ne', bounds: { x: 1900, y: 500, w: 600, h: 600 },
                        roofTexture: 'Brick Plaster/Brick_Plaster_03_Orange_1.png', floorTexture: 'Wood_Planks_01_Brown_2.png',
                        wallTexture: 'Brick Plaster/Brick_Plaster_04_Orange_1.png',
                        entrances: [{ x: 2000, y: 1050, w: 150, h: 50 }, { x: 1900, y: 700, w: 50, h: 150 }], // South & West doors to roads
                        walls: [
                            { x: 1900, y: 500, w: 600, h: 50 }, // North wall
                            { x: 2450, y: 550, w: 50, h: 550 }, // East wall
                            { x: 1900, y: 1050, w: 100, h: 50 }, // South wall left
                            { x: 2150, y: 1050, w: 350, h: 50 }, // South wall right
                            { x: 1900, y: 500, w: 50, h: 200 }, // West wall top
                            { x: 1900, y: 850, w: 50, h: 250 }  // West wall bottom
                        ]
                    },
                    // SW House
                    {
                        id: 'house_sw', bounds: { x: 500, y: 1900, w: 600, h: 600 },
                        roofTexture: 'Brick Plaster/Brick_Plaster_03_Brown_1.png', floorTexture: 'Wood_Planks_01_Brown_3.png',
                        wallTexture: 'Brick Plaster/Brick_Plaster_04_Brown_1.png',
                        entrances: [{ x: 800, y: 1900, w: 150, h: 50 }, { x: 1050, y: 2100, w: 50, h: 150 }], // North & East doors to roads
                        walls: [
                            { x: 500, y: 2450, w: 600, h: 50 }, // South wall
                            { x: 500, y: 1900, w: 50, h: 550 }, // West wall
                            { x: 500, y: 1900, w: 300, h: 50 }, // North wall left
                            { x: 950, y: 1900, w: 150, h: 50 }, // North wall right
                            { x: 1050, y: 1900, w: 50, h: 200 }, // East wall top
                            { x: 1050, y: 2250, w: 50, h: 250 }  // East wall bottom
                        ]
                    },
                    // SE House
                    {
                        id: 'house_se', bounds: { x: 1900, y: 1900, w: 600, h: 600 },
                        roofTexture: 'Brick Plaster/Brick_Plaster_03_Black_1.png', floorTexture: 'Wood_Planks_01_Brown_4.png',
                        wallTexture: 'Brick Plaster/Brick_Plaster_04_Black_1.png',
                        entrances: [{ x: 2000, y: 1900, w: 150, h: 50 }, { x: 1900, y: 2100, w: 50, h: 150 }], // North & West doors to roads
                        walls: [
                            { x: 1900, y: 2450, w: 600, h: 50 }, // South wall
                            { x: 2450, y: 1900, w: 50, h: 550 }, // East wall
                            { x: 1900, y: 1900, w: 100, h: 50 }, // North wall left
                            { x: 2150, y: 1900, w: 350, h: 50 }, // North wall right
                            { x: 1900, y: 1900, w: 50, h: 200 }, // West wall top
                            { x: 1900, y: 2250, w: 50, h: 250 }  // West wall bottom
                        ]
                    }
                ],
                obstacles: [
                    // Parked cars on the streets
                    { x: 1350, y: 400, w: 100, h: 200, texture: 'Vehicles/Audi.png', type: 'building' },
                    { x: 1450, y: 1400, w: 200, h: 100, texture: 'Vehicles/Police.png', type: 'building' },
                    { x: 1350, y: 2400, w: 100, h: 200, texture: 'Vehicles/Black_viper.png', type: 'building' },
                    { x: 400, y: 1350, w: 200, h: 100, texture: 'Vehicles/taxi.png', type: 'building' },
                    { x: 2400, y: 1450, w: 200, h: 100, texture: 'Vehicles/taxi.png', type: 'building' },

                    // Furniture for house_nw (Living Room)
                    { x: 550, y: 600, w: 160, h: 80, texture: 'Furniture/Sofas/Sofa_Long_Green.png', type: 'building' },
                    { x: 550, y: 750, w: 100, h: 50, texture: 'Electronics/TVs/TV_Stand_Style1.png', type: 'building' },
                    { x: 900, y: 600, w: 80, h: 80, texture: 'Furniture/Chairs/Armchair_Green.png', type: 'building' },

                    // Furniture for house_ne (Bedrooms)
                    { x: 1950, y: 550, w: 120, h: 180, texture: 'Furniture/Beds/Bed_Blue.png', type: 'building' },
                    { x: 2300, y: 550, w: 120, h: 180, texture: 'Furniture/Beds/Bed_Red.png', type: 'building' },
                    { x: 2150, y: 900, w: 100, h: 100, texture: 'Decor/Plants/Plant_1.png', type: 'building' },

                    // Furniture for house_sw (Dining/Kitchen)
                    { x: 600, y: 2000, w: 200, h: 120, texture: 'Furniture/Tables/Table_Long_Wood.png', type: 'building' },
                    { x: 600, y: 1920, w: 60, h: 60, texture: 'Furniture/Chairs/Armchair_Beige.png', type: 'building' },
                    { x: 740, y: 1920, w: 60, h: 60, texture: 'Furniture/Chairs/Armchair_Beige.png', type: 'building' },
                    { x: 900, y: 2200, w: 100, h: 100, texture: 'Furniture/Tables/Cabinet_Dark.png', type: 'building' },

                    // Furniture for house_se (Lounge)
                    { x: 2000, y: 2000, w: 160, h: 80, texture: 'Furniture/Sofas/Sofa_Short_Red.png', type: 'building' },
                    { x: 2300, y: 2000, w: 160, h: 80, texture: 'Furniture/Sofas/Sofa_Short_Red.png', type: 'building' },
                    { x: 2150, y: 2150, w: 120, h: 80, texture: 'Furniture/Tables/Table_Oval_Walnut.png', type: 'building' },
                    { x: 2400, y: 2400, w: 80, h: 80, texture: 'Decor/Plants/Plant_2.png', type: 'building' }
                ]
            },
            'forest_base': {
                width: 4000,
                height: 4000,
                baseTexture: 'Grass_01_Green_1.png',
                terrainRegions: [
                    // Dirt paths leading to the base
                    { x: 500, y: 1800, w: 1500, h: 400, texture: 'Dirt_Cracked_01_Brown_1.png', type: 'walkable' },
                    { x: 1800, y: 500, w: 400, h: 1500, texture: 'Dirt_Cracked_01_Brown_1.png', type: 'walkable' },
                    { x: 1800, y: 2000, w: 400, h: 1500, texture: 'Dirt_Cracked_01_Brown_1.png', type: 'walkable' },
                    // Base Concrete Foundation
                    { x: 2000, y: 1500, w: 1500, h: 1000, texture: 'Metal_01_Grey_Square_1.png', type: 'walkable' }
                ],
                spawnPoints: {
                    blue: [{ x: 300, y: 2000 }],  // Forest attackers
                    red: [{ x: 3200, y: 2000 }]   // Base defenders
                },
                buildings: [
                    // Main Base Headquarters
                    {
                        id: 'base_hq', bounds: { x: 2600, y: 1600, w: 600, h: 800 },
                        roofTexture: 'Metal_01_Blue_1.png', floorTexture: 'Metal_01_Grey_1.png',
                        wallTexture: 'Metal_01_Grey_1.png',
                        entrances: [
                            { x: 2600, y: 1900, w: 50, h: 200 } // West Entrance
                        ],
                        walls: [
                            { x: 2600, y: 1600, w: 600, h: 50 }, // North
                            { x: 2600, y: 2350, w: 600, h: 50 }, // South
                            { x: 3150, y: 1600, w: 50, h: 800 }, // East
                            { x: 2600, y: 1600, w: 50, h: 300 }, // West Top
                            { x: 2600, y: 2100, w: 50, h: 300 }  // West Bottom
                        ]
                    },
                    // North Checkpoint
                    {
                        id: 'north_chk', bounds: { x: 2100, y: 1550, w: 300, h: 200 },
                        roofTexture: 'Metal_02_Grey_Corrugated_1.png', floorTexture: 'Metal_01_Grey_1.png',
                        wallTexture: 'Metal_01_Grey_1.png',
                        entrances: [{ x: 2100, y: 1600, w: 50, h: 100 }, { x: 2350, y: 1600, w: 50, h: 100 }],
                        walls: [
                            { x: 2100, y: 1550, w: 300, h: 50 },
                            { x: 2100, y: 1700, w: 300, h: 50 },
                            { x: 2100, y: 1550, w: 50, h: 50 },
                            { x: 2100, y: 1700, w: 50, h: 50 },
                            { x: 2350, y: 1550, w: 50, h: 50 },
                            { x: 2350, y: 1700, w: 50, h: 50 }
                        ]
                    },
                    // South Checkpoint
                    {
                        id: 'south_chk', bounds: { x: 2100, y: 2250, w: 300, h: 200 },
                        roofTexture: 'Metal_02_Grey_Corrugated_1.png', floorTexture: 'Metal_01_Grey_1.png',
                        wallTexture: 'Metal_01_Grey_1.png',
                        entrances: [{ x: 2100, y: 2300, w: 50, h: 100 }, { x: 2350, y: 2300, w: 50, h: 100 }],
                        walls: [
                            { x: 2100, y: 2250, w: 300, h: 50 },
                            { x: 2100, y: 2400, w: 300, h: 50 },
                            { x: 2100, y: 2250, w: 50, h: 50 },
                            { x: 2100, y: 2400, w: 50, h: 50 },
                            { x: 2350, y: 2250, w: 50, h: 50 },
                            { x: 2350, y: 2400, w: 50, h: 50 }
                        ]
                    }
                ],
                obstacles: [
                    // Base Outer Walls
                    { x: 2000, y: 1500, w: 50, h: 1000, texture: 'Metal_04_Yellow_01.png', type: 'building' },
                    { x: 2050, y: 1500, w: 1450, h: 50, texture: 'Metal_04_Yellow_01.png', type: 'building' },
                    { x: 2050, y: 2450, w: 1450, h: 50, texture: 'Metal_04_Yellow_01.png', type: 'building' },

                    // Dense Forest "Trees" using real tree sprites
                    { x: 600, y: 600, w: 200, h: 200, texture: 'all textures/tree_spruce.png', type: 'building' },
                    { x: 1000, y: 800, w: 250, h: 250, texture: 'all textures/tree_jungle.png', type: 'building' },
                    { x: 1300, y: 500, w: 180, h: 180, texture: 'all textures/tree_birch.png', type: 'building' },

                    { x: 600, y: 2600, w: 220, h: 220, texture: 'all textures/tree_spruce.png', type: 'building' },
                    { x: 1000, y: 2900, w: 250, h: 250, texture: 'all textures/tree_birch.png', type: 'building' },
                    { x: 1400, y: 2400, w: 200, h: 200, texture: 'all textures/tree_jungle.png', type: 'building' },

                    { x: 1200, y: 1400, w: 180, h: 180, texture: 'all textures/tree_spruce (2).png', type: 'building' },
                    { x: 800, y: 1600, w: 220, h: 220, texture: 'all textures/tree_birch (2).png', type: 'building' },

                    // Fallen Logs (Walkable or small obstacles)
                    { x: 1500, y: 1000, w: 200, h: 60, texture: 'all textures/log_acacia_top (10).png', type: 'building' },
                    { x: 900, y: 2200, w: 60, h: 200, texture: 'all textures/log_acacia_top (12).png', type: 'building' },

                    // Base supplies
                    { x: 2100, y: 1800, w: 80, h: 80, texture: 'all textures/IconBarrelCompost.png', type: 'building' },
                    { x: 2100, y: 1900, w: 80, h: 80, texture: 'all textures/IconBarrelCompost.png', type: 'building' },
                    { x: 2180, y: 1850, w: 80, h: 80, texture: 'all textures/IconBarrelCompost.png', type: 'building' },

                    // Military/Base Vehicles
                    { x: 2250, y: 2100, w: 100, h: 200, texture: 'Vehicles/Ambulance.png', type: 'building' },
                    { x: 2400, y: 1800, w: 100, h: 200, texture: 'Vehicles/truck.png', type: 'building' }
                ]
            },
            'roadside_motel': {
                width: 8000,
                height: 8000,
                baseTexture: 'Dirt_Cracked_01_Brown_1.png',
                terrainRegions: [
                    { x: 3500, y: 0, w: 1000, h: 8000, texture: 'Concrete_02_Grey_Rows_1.png', type: 'walkable' },
                    { x: 4500, y: 3000, w: 2000, h: 2500, texture: 'Concrete_02_Grey_Square_1.png', type: 'walkable' },
                    { x: 0, y: 4000, w: 3500, h: 400, texture: 'Dirt_Pebbles_01_Yellow_1.png', type: 'walkable' }
                ],
                spawnPoints: {
                    blue: [{ x: 1000, y: 4200 }],
                    red: [{ x: 6000, y: 4200 }]
                },
                buildings: [
                    {
                        id: 'motel_office', bounds: { x: 6000, y: 3000, w: 500, h: 600 },
                        roofTexture: 'Brick Plaster/Brick_Plaster_03_Red_1.png', floorTexture: 'Wood_Planks_01_Brown_2.png',
                        wallTexture: 'Brick Plaster/Brick_Plaster_04_Red_1.png',
                        entrances: [
                            { x: 6000, y: 3200, w: 50, h: 200 },
                            { x: 6200, y: 3600, w: 150, h: 50 }
                        ],
                        walls: [
                            { x: 6000, y: 3000, w: 500, h: 50 },
                            { x: 6000, y: 3550, w: 200, h: 50 },
                            { x: 6350, y: 3550, w: 150, h: 50 },
                            { x: 6000, y: 3000, w: 50, h: 200 },
                            { x: 6000, y: 3400, w: 50, h: 200 },
                            { x: 6450, y: 3000, w: 50, h: 600 },
                            { x: 6150, y: 3150, w: 50, h: 200 },
                            { x: 6150, y: 3350, w: 150, h: 50 }
                        ]
                    },
                    {
                        id: 'motel_rooms_1', bounds: { x: 5000, y: 3000, w: 400, h: 1200 },
                        roofTexture: 'Brick Plaster/Brick_Plaster_03_Grey_1.png', floorTexture: 'Grass_01_Green_2.png',
                        wallTexture: 'Brick Plaster/Brick_Plaster_04_Grey_1.png',
                        entrances: [
                            { x: 5000, y: 3100, w: 50, h: 100 }, { x: 5400, y: 3100, w: 50, h: 100 },
                            { x: 5000, y: 3500, w: 50, h: 100 }, { x: 5400, y: 3500, w: 50, h: 100 },
                            { x: 5000, y: 3900, w: 50, h: 100 }, { x: 5400, y: 3900, w: 50, h: 100 }
                        ],
                        walls: [
                            { x: 5000, y: 3000, w: 400, h: 50 }, { x: 5000, y: 4150, w: 400, h: 50 },
                            { x: 5000, y: 3400, w: 400, h: 50 }, { x: 5000, y: 3800, w: 400, h: 50 },
                            { x: 5000, y: 3000, w: 50, h: 100 }, { x: 5000, y: 3200, w: 50, h: 200 },
                            { x: 5350, y: 3000, w: 50, h: 100 }, { x: 5350, y: 3200, w: 50, h: 200 },
                            { x: 5000, y: 3450, w: 50, h: 50 }, { x: 5000, y: 3600, w: 50, h: 200 },
                            { x: 5350, y: 3450, w: 50, h: 50 }, { x: 5350, y: 3600, w: 50, h: 200 },
                            { x: 5000, y: 3850, w: 50, h: 50 }, { x: 5000, y: 4000, w: 50, h: 150 },
                            { x: 5350, y: 3850, w: 50, h: 50 }, { x: 5350, y: 4000, w: 50, h: 150 }
                        ]
                    },
                    {
                        id: 'motel_rooms_2', bounds: { x: 5000, y: 4200, w: 1500, h: 400 },
                        roofTexture: 'Brick Plaster/Brick_Plaster_03_Grey_1.png', floorTexture: 'Grass_01_Green_2.png',
                        wallTexture: 'Brick Plaster/Brick_Plaster_04_Grey_1.png',
                        entrances: [
                            { x: 5100, y: 4200, w: 100, h: 50 }, { x: 5100, y: 4600, w: 100, h: 50 },
                            { x: 5500, y: 4200, w: 100, h: 50 }, { x: 5500, y: 4600, w: 100, h: 50 },
                            { x: 5900, y: 4200, w: 100, h: 50 }, { x: 5900, y: 4600, w: 100, h: 50 },
                            { x: 6300, y: 4200, w: 100, h: 50 }, { x: 6300, y: 4600, w: 100, h: 50 }
                        ],
                        walls: [
                            { x: 5000, y: 4200, w: 50, h: 400 }, { x: 6450, y: 4200, w: 50, h: 400 },
                            { x: 5400, y: 4200, w: 50, h: 400 }, { x: 5800, y: 4200, w: 50, h: 400 },
                            { x: 6200, y: 4200, w: 50, h: 400 }, { x: 5000, y: 4200, w: 100, h: 50 },
                            { x: 5200, y: 4200, w: 200, h: 50 }, { x: 5000, y: 4550, w: 100, h: 50 },
                            { x: 5200, y: 4550, w: 200, h: 50 }, { x: 5450, y: 4200, w: 50, h: 50 },
                            { x: 5600, y: 4200, w: 200, h: 50 }, { x: 5450, y: 4550, w: 50, h: 50 },
                            { x: 5600, y: 4550, w: 200, h: 50 }, { x: 5850, y: 4200, w: 50, h: 50 },
                            { x: 6000, y: 4200, w: 200, h: 50 }, { x: 5850, y: 4550, w: 50, h: 50 },
                            { x: 6000, y: 4550, w: 200, h: 50 }, { x: 6250, y: 4200, w: 50, h: 50 },
                            { x: 6400, y: 4200, w: 50, h: 50 }, { x: 6250, y: 4550, w: 50, h: 50 },
                            { x: 6400, y: 4550, w: 50, h: 50 }
                        ]
                    }
                ],
                obstacles: [
                    { x: 3800, y: 1500, w: 200, h: 400, texture: 'Dirt_Rocks_01_Brown_2.png', type: 'building' },
                    { x: 4100, y: 3500, w: 200, h: 400, texture: 'Dirt_Rocks_01_Brown_2.png', type: 'building' },
                    { x: 3700, y: 5500, w: 400, h: 200, texture: 'Dirt_Rocks_01_Brown_2.png', type: 'building' },
                    { x: 4200, y: 6500, w: 200, h: 400, texture: 'Dirt_Rocks_01_Brown_2.png', type: 'building' },
                    { x: 1000, y: 2000, w: 600, h: 600, texture: 'Dirt_Rocks_01_Grey_1.png', type: 'building' },
                    { x: 2500, y: 1000, w: 600, h: 600, texture: 'Dirt_Rocks_01_Grey_1.png', type: 'building' },
                    { x: 1500, y: 6000, w: 600, h: 600, texture: 'Dirt_Rocks_01_Grey_1.png', type: 'building' },
                    { x: 2500, y: 7000, w: 600, h: 600, texture: 'Dirt_Rocks_01_Grey_1.png', type: 'building' },
                    { x: 4500, y: 3000, w: 500, h: 50, texture: 'Metal_04_Yellow_01.png', type: 'building' },
                    { x: 6500, y: 3000, w: 50, h: 2500, texture: 'Metal_04_Yellow_01.png', type: 'building' },
                    { x: 3800, y: 1800, w: 200, h: 400, texture: 'Vehicles/truck.png', type: 'building' },
                    { x: 3900, y: 4000, w: 100, h: 200, texture: 'Vehicles/Black_viper.png', type: 'building' },
                    { x: 3600, y: 6000, w: 100, h: 200, texture: 'Vehicles/taxi.png', type: 'building' },
                    { x: 4200, y: 2500, w: 100, h: 200, texture: 'Vehicles/Police.png', type: 'building' },
                    { x: 5500, y: 3200, w: 200, h: 100, texture: 'Vehicles/Mini_van.png', type: 'building' },
                    { x: 5500, y: 3500, w: 200, h: 100, texture: '', type: 'building' },
                    { x: 5800, y: 3800, w: 200, h: 100, texture: 'Vehicles/Audi.png', type: 'building' }
                ]
            },
            'sinister_mansion': {
                width: 4000,
                height: 4000,
                baseTexture: 'Grass_01_Green_1.png',
                terrainRegions: [
                    { x: 1800, y: 3000, w: 400, h: 1000, texture: 'Dirt_Cracked_01_Brown_1.png', type: 'walkable' },
                    { x: 500, y: 500, w: 1000, h: 1000, texture: 'Dirt_Silt_01_Brown_1.png', type: 'walkable' }
                ],
                spawnPoints: {
                    blue: [{ x: 2000, y: 3800 }],
                    red: [{ x: 2000, y: 200 }]
                },
                buildings: [
                    {
                        id: 'mansion_main_hall', bounds: { x: 1200, y: 1000, w: 1600, h: 1800 },
                        roofTexture: 'Brick Plaster/Brick_Plaster_03_Black_1.png', floorTexture: 'Wood_Planks_01_Brown_4.png',
                        wallTexture: 'Brick Plaster/Brick_Plaster_04_Black_1.png',
                        entrances: [
                            { x: 1900, y: 2800, w: 200, h: 50 }, { x: 1900, y: 1000, w: 200, h: 50 },
                            { x: 1200, y: 1800, w: 50, h: 200 }, { x: 2750, y: 1800, w: 50, h: 200 }
                        ],
                        walls: [
                            // Exterior Walls
                            { x: 1200, y: 1000, w: 700, h: 50 }, { x: 2100, y: 1000, w: 700, h: 50 },
                            { x: 1200, y: 2800, w: 700, h: 50 }, { x: 2100, y: 2800, w: 700, h: 50 },
                            { x: 1200, y: 1000, w: 50, h: 800 }, { x: 1200, y: 2000, w: 50, h: 800 },
                            { x: 2750, y: 1000, w: 50, h: 800 }, { x: 2750, y: 2000, w: 50, h: 800 },

                            // Internal Partition: Library (NW)
                            { x: 1250, y: 1600, w: 600, h: 50 }, // South wall of Library
                            { x: 1850, y: 1050, w: 50, h: 400 }, // East wall of Library (top)
                            { x: 1850, y: 1550, w: 50, h: 100 }, // East wall of Library (bottom)

                            // Internal Partition: Kitchen (NE)
                            { x: 2150, y: 1600, w: 600, h: 50 }, // South wall of Kitchen
                            { x: 2100, y: 1050, w: 50, h: 550 }, // West wall of Kitchen

                            // Internal Partition: Master Bedroom (SW)
                            { x: 1250, y: 2200, w: 600, h: 50 }, // North wall of Bedroom
                            { x: 1850, y: 2250, w: 50, h: 550 }, // East wall of Bedroom

                            // Internal Partition: Dining Room (SE)
                            { x: 2150, y: 2200, w: 600, h: 50 }, // North wall of Dining
                            { x: 2100, y: 2200, w: 50, h: 600 }, // West wall of Dining

                            // Corridor logic: Add "entrances" (doors) between these rooms
                            { x: 1850, y: 1450, w: 50, h: 100, isDoor: true }, // Library Door
                            { x: 2100, y: 1450, w: 50, h: 100, isDoor: true }, // Kitchen Door
                            { x: 1850, y: 2400, w: 50, h: 100, isDoor: true }, // Bedroom Door
                            { x: 2100, y: 2400, w: 50, h: 100, isDoor: true }  // Dining Door
                        ]
                    }
                ],
                obstacles: [
                    { x: 600, y: 600, w: 100, h: 50, texture: 'all textures/cobblestone_mossy (10).png', type: 'building' },
                    { x: 800, y: 800, w: 50, h: 100, texture: 'all textures/cobblestone_mossy (11).png', type: 'building' },
                    
                    // Mansion Furniture
                    // Mansion Furniture
                    { x: 1300, y: 1100, w: 100, h: 100, texture: 'Furniture/Tables/Cabinet_Small.png', type: 'building' },
                    { x: 1500, y: 1100, w: 120, h: 180, texture: 'Furniture/Beds/Bed_Grey.png', type: 'building' }, // Bedroom 1
                    { x: 2600, y: 1100, w: 100, h: 50, texture: 'Electronics/TVs/TV_Stand_Style8.png', type: 'building' }, 
                    { x: 1300, y: 2600, w: 100, h: 100, texture: 'Furniture/Tables/Cabinet_Antique.png', type: 'building' },
                    { x: 2600, y: 2700, w: 200, h: 100, texture: 'Furniture/Tables/Table_Long_Wood.png', type: 'building' },
                    { x: 2100, y: 1200, w: 80, h: 80, texture: 'Decor/Plants/Plant_4.png', type: 'building' },

                    // Living area in the mansion center
                    { x: 1900, y: 1800, w: 160, h: 80, texture: 'Furniture/Sofas/Sofa_Long_Black.png', type: 'building' },
                    { x: 1900, y: 2000, w: 80, h: 80, texture: 'Furniture/Chairs/Armchair_Black.png', type: 'building' },

                    // Spider Webs and other existing decors
                    { x: 1210, y: 1010, w: 100, h: 100, texture: 'all textures/web (3).png', type: 'walkable' },
                    { x: 2000, y: 1010, w: 100, h: 100, texture: 'all textures/web (4).png', type: 'walkable' },
                    { x: 1210, y: 2700, w: 100, h: 100, texture: 'all textures/web (5).png', type: 'walkable' },
                    { x: 2000, y: 2700, w: 100, h: 100, texture: 'all textures/web (6).png', type: 'walkable' },
                    { x: 2000, y: 1610, w: 100, h: 100, texture: 'all textures/web (7).png', type: 'walkable' },

                    // Blood stains
                    { x: 2000, y: 1500, w: 100, h: 100, texture: 'all textures/redstone_block (42).png', type: 'walkable' },
                    { x: 1500, y: 2000, w: 120, h: 120, texture: 'all textures/redstone_block (42).png', type: 'walkable' },

                    // Vehicles outside
                    { x: 1850, y: 3200, w: 200, h: 200, texture: 'Vehicles/Black_viper.png', type: 'building' },
                    { x: 2050, y: 3500, w: 200, h: 200, texture: 'Vehicles/Ambulance.png', type: 'building' },

                    // Forest nearby
                    { x: 2800, y: 2800, w: 200, h: 200, texture: 'all textures/tree_spruce.png', type: 'building' },
                    { x: 3200, y: 3000, w: 200, h: 200, texture: 'all textures/tree_birch.png', type: 'building' },
                    { x: 2900, y: 3300, w: 150, h: 150, texture: 'all textures/tree_jungle.png', type: 'building' },
                    { x: 3500, y: 2800, w: 250, h: 250, texture: 'all textures/tree_spruce (2).png', type: 'building' },
                    { x: 1900, y: 600, w: 150, h: 150, texture: 'all textures/tree_spruce.png', type: 'building' },
                    { x: 1600, y: 700, w: 128, h: 128, texture: 'all textures/tree_birch.png', type: 'building' }
                ]
            },
            'pueblo_calle': {
                width: 4000,
                height: 2000,
                baseTexture: 'Grass_01_Green_1.png',
                controlZones: [
                    { id: 'plaza', x: 2000, y: 1000, radius: 250, owner: null, progress: 0 }
                ],
                terrainRegions: [
                    // Main street
                    { x: 0, y: 800, w: 4000, h: 400, texture: 'Concrete_02_Grey_1.png', type: 'walkable' },
                    // Sidewalks
                    { x: 0, y: 700, w: 4000, h: 100, texture: 'Concrete_02_Grey_Rows_1.png', type: 'walkable' },
                    { x: 0, y: 1200, w: 4000, h: 100, texture: 'Concrete_02_Grey_Rows_1.png', type: 'walkable' }
                ],
                spawnPoints: {
                    blue: [{ x: 200, y: 1000 }],
                    red: [{ x: 3800, y: 1000 }]
                },
                buildings: [
                    // --- NORTH SIDE BUILDINGS (Stuck together) ---
                    // Carniceria
                    {
                        id: 'carniceria', bounds: { x: 500, y: 200, w: 600, h: 500 },
                        roofTexture: 'Roof_Tiles_01_Red_1.png', floorTexture: 'Tiles Rectangle/Tiles_Rectangle_01_White_1.png',
                        wallTexture: 'Brick Plaster/Brick_Plaster_04_Red_1.png',
                        entrances: [{ x: 700, y: 700, w: 150, h: 50 }],
                        walls: [
                            { x: 500, y: 200, w: 600, h: 50 }, // Top
                            { x: 500, y: 250, w: 50, h: 450 }, // Left
                            { x: 1050, y: 250, w: 50, h: 450 }, // Right (Shared)
                            { x: 500, y: 700, w: 200, h: 50 }, // Bottom Left
                            { x: 850, y: 700, w: 250, h: 50 }  // Bottom Right
                        ]
                    },
                    // Supermercado
                    {
                        id: 'supermercado', bounds: { x: 1100, y: 200, w: 1000, h: 500 },
                        roofTexture: 'Metal_02_Grey_Corrugated_1.png', floorTexture: 'Concrete_02_Grey_1.png',
                        wallTexture: 'Metal_01_Grey_1.png',
                        entrances: [{ x: 1500, y: 700, w: 200, h: 50 }],
                        walls: [
                            { x: 1100, y: 200, w: 1000, h: 50 }, // Top
                            { x: 1100, y: 250, w: 50, h: 450 }, 
                            { x: 2050, y: 250, w: 50, h: 450 }, // Right
                            { x: 1100, y: 700, w: 400, h: 50 }, // Bottom Left
                            { x: 1700, y: 700, w: 400, h: 50 }  // Bottom Right
                        ]
                    },
                    // Colegio
                    {
                        id: 'colegio', bounds: { x: 2100, y: 150, w: 1200, h: 550 },
                        roofTexture: 'Brick Plaster/Brick_Plaster_03_Grey_1.png', floorTexture: 'Wood_Planks_01_Brown_2.png',
                        wallTexture: 'Brick Plaster/Brick_Plaster_04_Grey_1.png',
                        entrances: [{ x: 2550, y: 700, w: 300, h: 50 }],
                        walls: [
                            { x: 2100, y: 150, w: 1200, h: 50 }, // Top
                            { x: 2100, y: 200, w: 50, h: 500 }, // Left
                            { x: 3250, y: 200, w: 50, h: 500 }, // Right
                            { x: 2100, y: 700, w: 450, h: 50 }, // Bottom Left
                            { x: 2850, y: 700, w: 450, h: 50 }  // Bottom Right
                        ]
                    },
                    // --- SOUTH SIDE BUILDINGS (Stuck together) ---
                    // Hotel
                    {
                        id: 'hotel', bounds: { x: 800, y: 1300, w: 1400, h: 600 },
                        roofTexture: 'Roof_Tiles_01_Blue_1.png', floorTexture: 'Pattern_01_Retro_Carpet_Red_1.png',
                        wallTexture: 'Painted_Wall_01_Yellow_1.png',
                        entrances: [{ x: 1400, y: 1300, w: 200, h: 50 }],
                        walls: [
                            { x: 800, y: 1850, w: 1400, h: 50 }, // Bottom
                            { x: 800, y: 1350, w: 50, h: 500 }, // Left
                            { x: 2150, y: 1350, w: 50, h: 500 }, // Right
                            { x: 800, y: 1300, w: 600, h: 50 }, // Top Left
                            { x: 1600, y: 1300, w: 600, h: 50 }  // Top Right
                        ]
                    },
                    // Apartamentos
                    {
                        id: 'apartamentos', bounds: { x: 2200, y: 1300, w: 1000, h: 600 },
                        roofTexture: 'Roof_Tiles_01_Grey_1.png', floorTexture: 'Wood_Planks_01_Brown_1.png',
                        wallTexture: 'Painted_Wall_01_Grey_1.png',
                        entrances: [{ x: 2500, y: 1300, w: 150, h: 50 }],
                        walls: [
                            { x: 2200, y: 1850, w: 1000, h: 50 }, // Bottom
                            { x: 2200, y: 1350, w: 50, h: 500 }, // Left
                            { x: 3150, y: 1350, w: 50, h: 500 }, // Right
                            { x: 2200, y: 1300, w: 300, h: 50 }, // Top Left
                            { x: 2650, y: 1300, w: 550, h: 50 }  // Top Right
                        ]
                    }
                ],
                obstacles: [
                    // Cars on street
                    { x: 600, y: 850, w: 240, h: 120, texture: 'Vehicles/Audi.png', type: 'building' },
                    { x: 1500, y: 1050, w: 200, h: 100, texture: 'Vehicles/Police.png', type: 'building' },
                    { x: 2300, y: 880, w: 240, h: 120, texture: 'Vehicles/taxi.png', type: 'building' },
                    { x: 2800, y: 1040, w: 240, h: 120, texture: 'Vehicles/Mini_van.png', type: 'building' },

                    // Carniceria details
                    { x: 550, y: 600, w: 400, h: 60, texture: 'Furniture/Tables/Table_Long_Wood.png', type: 'building' },
                    { x: 650, y: 550, w: 50, h: 50, texture: 'Effects/blood.png', type: 'walkable' },
                    { x: 580, y: 530, w: 50, h: 50, texture: 'Effects/blood.png', type: 'walkable' },
                    { x: 800, y: 250, w: 150, h: 150, texture: 'Characters/dead character.png', type: 'walkable' },

                    // Supermercado details
                    { x: 1200, y: 300, w: 200, h: 80, texture: 'Furniture/Tables/Cabinet_Veneer.png', type: 'building' },
                    { x: 1500, y: 300, w: 200, h: 80, texture: 'Furniture/Tables/Cabinet_Veneer.png', type: 'building' },
                    { x: 1800, y: 300, w: 200, h: 80, texture: 'Furniture/Tables/Cabinet_Veneer.png', type: 'building' },
                    { x: 1200, y: 500, w: 200, h: 80, texture: 'Furniture/Tables/Cabinet_Veneer.png', type: 'building' },
                    { x: 1500, y: 500, w: 200, h: 80, texture: 'Furniture/Tables/Cabinet_Veneer.png', type: 'building' },
                    { x: 1150, y: 650, w: 80, h: 80, texture: 'Decor/Plants/Plant_1.png', type: 'building' },

                    // Colegio details
                    { x: 2200, y: 250, w: 300, h: 50, texture: 'Electronics/TVs/TV_Stand_Style1.png', type: 'building' },
                    { x: 2300, y: 400, w: 150, h: 80, texture: 'Furniture/Tables/Table_Oval_Walnut.png', type: 'building' },
                    { x: 2300, y: 550, w: 150, h: 80, texture: 'Furniture/Tables/Table_Oval_Walnut.png', type: 'building' },
                    { x: 2600, y: 400, w: 150, h: 80, texture: 'Furniture/Tables/Table_Oval_Walnut.png', type: 'building' },
                    { x: 2600, y: 550, w: 150, h: 80, texture: 'Furniture/Tables/Table_Oval_Walnut.png', type: 'building' },
                    { x: 2900, y: 400, w: 150, h: 80, texture: 'Furniture/Tables/Table_Oval_Walnut.png', type: 'building' },
                    { x: 2900, y: 550, w: 150, h: 80, texture: 'Furniture/Tables/Table_Oval_Walnut.png', type: 'building' },

                    // Hotel
                    { x: 1300, y: 1500, w: 400, h: 100, texture: 'Furniture/Sofas/Sofa_Long_Red.png', type: 'building' },
                    { x: 900, y: 1400, w: 120, h: 180, texture: 'Furniture/Beds/Bed_Red.png', type: 'building' },
                    { x: 1100, y: 1400, w: 120, h: 180, texture: 'Furniture/Beds/Bed_Blue.png', type: 'building' },
                    { x: 1800, y: 1400, w: 120, h: 180, texture: 'Furniture/Beds/Bed_Grey.png', type: 'building' },
                    { x: 2000, y: 1400, w: 120, h: 180, texture: 'Furniture/Beds/Bed_Red.png', type: 'building' },

                    // Apartamentos details
                    { x: 2300, y: 1500, w: 120, h: 180, texture: 'Furniture/Beds/Bed_Blue.png', type: 'building' },
                    { x: 2700, y: 1500, w: 120, h: 180, texture: 'Furniture/Beds/Bed_Grey.png', type: 'building' },
                    { x: 2500, y: 1600, w: 150, h: 80, texture: 'Furniture/Tables/Table_Long_Wood.png', type: 'building' },
                    
                    // Street props
                    { x: 900, y: 1150, w: 60, h: 60, texture: 'Debris_Trash_Cans_1.png', type: 'building' },
                    { x: 2200, y: 750, w: 60, h: 60, texture: 'Debris_Trash_Cans_2.png', type: 'building' },
                    { x: 2250, y: 750, w: 50, h: 50, texture: 'Debris_Trash_Bags_Black_1.png', type: 'walkable' },
                    
                    // Sidewalk Trees
                    { x: 600, y: 650, w: 150, h: 150, texture: 'Decor/Plants/Plant_2.png', type: 'building' },
                    { x: 1800, y: 650, w: 150, h: 150, texture: 'Decor/Plants/Plant_4.png', type: 'building' },
                    { x: 3000, y: 650, w: 150, h: 150, texture: 'Decor/Plants/Plant_5.png', type: 'building' },
                    { x: 1000, y: 1200, w: 150, h: 150, texture: 'Decor/Plants/Plant_3.png', type: 'building' },
                    { x: 2500, y: 1200, w: 150, h: 150, texture: 'Decor/Plants/Plant_2.png', type: 'building' }
                ]
            }
        };

        // Load custom maps
        this.loadCustomMaps();
    }

    loadCustomMaps() {
        try {
            const mapsDir = path.join(__dirname, 'maps');
            if (fs.existsSync(mapsDir)) {
                const files = fs.readdirSync(mapsDir).filter(f => f.endsWith('.json'));
                for (let file of files) {
                    try {
                        let mapData = JSON.parse(fs.readFileSync(path.join(mapsDir, file)));
                        if (mapData && mapData.id) {
                            this.maps[mapData.id] = mapData;
                        }
                    } catch (e) {
                        console.error('Error loading custom map:', file, e);
                    }
                }
            }
        } catch(e) {}
    }

    getMap(id) {
        return this.maps[id] || this.maps['industrial_factory'];
    }

    getBuildingId(x, y, mapId) {
        const map = this.getMap(mapId);
        if (!map || !map.buildings) return null;
        for (let b of map.buildings) {
            if (x > b.bounds.x && x < b.bounds.x + b.bounds.w && y > b.bounds.y && y < b.bounds.y + b.bounds.h) {
                return b.id;
            }
        }
        return null;
    }

    getPhysicalObstacles(mapId) {
        const map = this.getMap(mapId);
        let obs = [];
        if (map.obstacles) {
            obs.push(...map.obstacles.filter(o => o.type !== 'walkable'));
        }
        if (map.buildings) {
            map.buildings.forEach(b => {
                if (b.walls) obs.push(...b.walls);
            });
        }
        if (map.terrainRegions) {
            map.terrainRegions.forEach(tr => {
                if (tr.type === 'unwalkable') obs.push(tr);
            });
        }
        return obs;
    }

    getRandomSpawn(mapId, team) {
        const map = this.getMap(mapId);
        const spawns = map.spawnPoints[team] || [{ x: 100, y: 100 }];
        const spawnCenter = spawns[Math.floor(Math.random() * spawns.length)];

        // Add tiny random offset so they don't spawn exactly on top of each other
        // Run collision check to prevent spawning inside physical obstacles
        const obs = this.getPhysicalObstacles(mapId);
        let finalX = spawnCenter.x;
        let finalY = spawnCenter.y;
        let foundSafe = false;

        for (let i = 0; i < 100; i++) {
            let testX = spawnCenter.x + (Math.random() * 400 - 200);
            let testY = spawnCenter.y + (Math.random() * 400 - 200);

            // Map bounds clamping
            testX = Math.max(32, Math.min(testX, map.width || 2000 - 32));
            testY = Math.max(32, Math.min(testY, map.height || 2000 - 32));

            let collision = false;

            for (let o of obs) {
                // Add padding (radius 32 for larger characters) for collision check
                if (testX + 32 > o.x && testX - 32 < o.x + o.w &&
                    testY + 32 > o.y && testY - 32 < o.y + o.h) {
                    collision = true;
                    break;
                }
            }
            if (!collision) {
                finalX = testX;
                finalY = testY;
                foundSafe = true;
                break;
            }
        }

        if (!foundSafe) {
            finalX = spawnCenter.x;
            finalY = spawnCenter.y;
        }

        return { x: finalX, y: finalY };
    }
}

module.exports = MapSystem;
