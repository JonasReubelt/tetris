import pygame
import numpy as np
from playfield import PlayField
from block import Block
import colors

WIDTH = 300
HEIGHT = 600
SIDE_LENGTH = 30

dead_rects = [pygame.Rect([-SIDE_LENGTH, 0, SIDE_LENGTH, HEIGHT]),
              pygame.Rect([WIDTH, 0, SIDE_LENGTH, HEIGHT]),
              #pygame.Rect([0, -SIDE_LENGTH, WIDTH, SIDE_LENGTH]),
              pygame.Rect([0, HEIGHT, WIDTH, SIDE_LENGTH])]

DISPLAY = pygame.display.set_mode((WIDTH, HEIGHT))

clock = pygame.time.Clock()

pygame.init()
pygame.display.set_caption('Tetris')
pygame.display.update()

running = True

speed = 0
kinds = ('square', 'stick', 'L', 'J', 'S', 'Z', 'T')
bc = 0
play_field = PlayField(DISPLAY, WIDTH, HEIGHT, SIDE_LENGTH)
block = Block(DISPLAY, WIDTH, HEIGHT, SIDE_LENGTH, kinds[bc%7])
dead_blocks = []

while running:

    for event in pygame.event.get():
        #print event
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            #print event.key
            if event.key == pygame.K_LEFT:
                block.move(-SIDE_LENGTH, dead_rects)
            if event.key == pygame.K_RIGHT:
                block.move(+SIDE_LENGTH, dead_rects)
            if event.key == 32:
                block.hard_drop = True
    if block.dead:
        for rect in block.rects:
            dead_rects.append(rect)
        dead_blocks.append(block)
        bc += 1
        block = Block(DISPLAY, WIDTH, HEIGHT, SIDE_LENGTH, kinds[bc%7])
    if block.hard_drop:
        for i in range(10):
            block.drop(dead_rects)

    play_field.draw()
    for dead_block in dead_blocks:
        dead_block.draw()
    block.draw()
    speed += 1
    if speed == 20:
        block.drop(dead_rects)
        speed = 0
    pygame.display.update()
    clock.tick(60)

pygame.quit()
